import {WhereStatementInterface} from "../../../where-statement-interface";
import {WhereStatementController} from "../../../where-statement-controller";
import {WhereHasStatementCallback} from "../where-has/where-has-statement-callback";
import {WhereStatementCallback} from "./where-statement-callback";
import {ModelStorage} from "../../../../../../store/model-storage";



export class WhereStatementCallbackStatement implements WhereStatementInterface{

    private modelStorage: ModelStorage;

    private whereStatementController: WhereStatementController;

    constructor(callback: any, modelStorage: ModelStorage) {
        this.modelStorage = modelStorage;

        this.whereStatementController = new WhereStatementController(modelStorage);

        this.processCallback(callback);
    }

    public has(key: string): boolean {
        return this.whereStatementController.has(key);
    }

    public hasWhereHas(key?: string): boolean {
        return this.whereStatementController.hasWhereHas(key);
    }

    public hasWhereHasComplicated(key?: string): boolean {
        return this.whereStatementController.hasWhereHasComplicated(key);
    }

    public hasWhereDoesntHave(key?: string): boolean {
        return this.whereStatementController.hasWhereDoesntHave(key);
    }

    public hasWhereDoesntHaveComplicated(key?: string): boolean {
        return this.whereStatementController.hasWhereDoesntHaveComplicated(key);
    }

    public check(object: any): boolean {
        return this.whereStatementController.check(object);
    }

    public filter(objects: any[]): any[] {
        return this.whereStatementController.filter(objects);
    }

    public getWhereStatementController(): WhereStatementController {
        return this.whereStatementController;
    }

    public getModelStorage(): ModelStorage {
        return this.modelStorage;
    }

    private processCallback(callback: WhereHasStatementCallback): void {
        new WhereStatementCallback(this, callback);
    }

}
