
import {WhereStatementController} from "../statements/where/where-statement-controller";
import {OrderByStatementController} from "../statements/order/order-by-statement-controller";
import {JoinStatementController} from "../statements/join/join-statement-controller";
import {ModelStorage} from "../../store/model-storage";

export class QueryData {

    private modelStorage: ModelStorage;

    private target_ids: (string | number)[];

    private data: { [key: string]: unknown }[];

    private whereStatementController: WhereStatementController;
    private orderByStatementController: OrderByStatementController;
    private joinStatementController: JoinStatementController;

    private initiated: boolean;

    constructor(modelStorage: ModelStorage) {
        this.modelStorage = modelStorage;

        this.target_ids = [];
        this.data = [];

        this.whereStatementController = new WhereStatementController(this.modelStorage);
        this.orderByStatementController = new OrderByStatementController(this.modelStorage.getPrimaryKey());
        this.joinStatementController = new JoinStatementController();

        this.initiated = false;
    }

    public has(key: string): boolean {
        if (this.getModelStorage().getName() === key) {
            return true;
        }
        if (this.whereStatementController.has(key)) {
            return true;
        }
        return this.joinStatementController.has(key);
    }

    public get(): unknown[] {
        return (this.initiated)
            ? this.data
            : this.init();
    }

    public set(data: { [key: string]: unknown }[]): void {
        this.data = data;
    }

    public getIds(): unknown[] {
        return this.data.map((obj) => obj[this.modelStorage.getPrimaryKey()]);
    }

    public setTargetIds(ids: (string | number)[]): void {
        if (!ids) {
            return;
        }
        this.target_ids = ids;
    }

    public hasIds(): boolean {
        return !!(this.target_ids.length);
    }

    public getWhereStatementController(): WhereStatementController {
        return this.whereStatementController;
    }

    public getOrderByStatementController(): OrderByStatementController {
        return this.orderByStatementController;
    }

    public getJoinStatementController(): JoinStatementController {
        return this.joinStatementController;
    }

    public getModelStorage(): ModelStorage {
        return this.modelStorage;
    }

    private init(): unknown[] {

        let data = (this.hasIds())
            ? this.modelStorage.find(this.target_ids)
            : this.modelStorage.get();

        if (this.whereStatementController.has()) {
            data = this.getWhereStatementController().filter(data);
        }

        let models = [];
        for (const obj of data) {
            models.push(this.getModelStorage().createModel(obj));
        }

        if (this.orderByStatementController.has()) {
            models = this.getOrderByStatementController().order(models);
        } else {
            models = this.getOrderByStatementController().orderDefault(models);
        }

        if (this.getJoinStatementController().has()) {
            this.getJoinStatementController().attachMany(models);
        }

        this.data = models;

        this.initiated = true;

        return this.data;
    }

}
