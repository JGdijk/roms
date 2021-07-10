
import {WhereStatementController} from "../../../where/where-statement-controller";
import {JoinStatementController} from "../../join-statement-controller";
import {JoinCallback} from "./join-callback";
import {JoinStatementInterface} from "../../join-statement-interface";
import {OrderByStatementController} from "../../../order/order-by-statement-controller";
import {RelationStorage} from "../../../../../store/relation/relation-storage";


export class JoinCallbackStatement implements JoinStatementInterface {

    private relationStorage: RelationStorage;

    private orderByStatementController: OrderByStatementController;
    private joinStatementController: JoinStatementController;
    private whereStatementController: WhereStatementController;

    constructor(relationStorage: RelationStorage, callback: any, chainedRelations?: string) {
        this.relationStorage = relationStorage;

        this.orderByStatementController = new OrderByStatementController(relationStorage.getRelationModelStorage().getPrimaryKey());
        this.joinStatementController = new JoinStatementController();
        this.whereStatementController = new WhereStatementController(relationStorage.getRelationModelStorage());

        if (chainedRelations) {
            this.processChainedRelations(chainedRelations, callback);
        } else {
            this.processCallback(callback);
        }
    }

    public attach(object: any): void {

        let relationStorage_objects = this.relationStorage.findByObject(object);

        // Returns if null or []
        if ((!this.relationStorage.getRelation().returnsMany() && !relationStorage_objects) || (Array.isArray(relationStorage_objects) && !relationStorage_objects.length)) {
            Object.defineProperty(object, this.relationStorage.getKey(), {
                value: relationStorage_objects,
                enumerable: true
            })
            return;
        }

        if (!Array.isArray(relationStorage_objects)) {
            // If the relationStorage doesn't pass the where statement return null.
            if (this.whereStatementController.has() && !this.getWhereStatementController().check(relationStorage_objects)) {
                Object.defineProperty(object, this.relationStorage.getKey(), {
                    value: null,
                    enumerable: true
                })
                return;
            }

            let model = this.relationStorage.getRelationModelStorage().createModel(relationStorage_objects);

            if (this.getJoinStatementController().has()) {
                this.getJoinStatementController().attach(model);
            }

            Object.defineProperty(object, this.relationStorage.getKey(), {
                value: model,
                enumerable: true
            })

            return;

        } else {
            if (this.whereStatementController.has()) {
                relationStorage_objects = this.getWhereStatementController().filter(relationStorage_objects);
            }

            let models = [];
            for (const obj of relationStorage_objects) {
                models.push(this.relationStorage.getRelationModelStorage().createModel(obj));
            }

            if (this.orderByStatementController.has()) {
                models = this.getOrderByStatementController().order(models);
            }

            if (this.getJoinStatementController().has()) {
                this.getJoinStatementController().attachMany(models);
            }

            Object.defineProperty(object, this.relationStorage.getKey(), {
                value: models,
                enumerable: true
            })

            return;
        }
    }

    public has(key: string): boolean {
        if (key === this.relationStorage.getRelationModelStorage().getName()) {
            return true;
        }
        if (this.getJoinStatementController().has(key)) {
            return true;
        }
        return this.getWhereStatementController().has(key);
    }

    public hasStatements(key?: string): boolean {
        return this.getJoinStatementController().has();
    }

    public getStatements(): JoinStatementInterface[] {
        return this.getJoinStatementController().getStatements();
    }

    private processCallback(callback: JoinCallback): void {
        new JoinCallback(this, callback);
    }

    public hasWhereStatements(): boolean {
        return this.getWhereStatementController().has();
    }

    public hasOrderByStatements(): boolean {
        return this.getOrderByStatementController().has();
    }

    public getOrderByStatementController(): OrderByStatementController {
        return this.orderByStatementController;
    }

    public getJoinStatementController(): JoinStatementController {
        return this.joinStatementController;
    }

    public getWhereStatementController(): WhereStatementController {
        return this.whereStatementController;
    }

    public getRelationStorage(): RelationStorage {
        return this.relationStorage;
    }

    // todo should extend on a baseclass
    public processChainedRelations(relation: string, callback: any) {

    }

}
