import {WhereStatementInterface} from "../../../where-statement-interface";
import {WhereHasStatementCallback} from "./where-has-statement-callback";
import {WhereStatementController} from "../../../where-statement-controller";
import {RelationStorage} from "../../../../../../store/relation/relation-storage";


export class WhereHasStatementCallbackStatement implements WhereStatementInterface {

    private relationStorage: RelationStorage;

    private whereStatementController: WhereStatementController;

    constructor(relationStorage: RelationStorage, callback: any) {
        this.relationStorage = relationStorage;

        this.whereStatementController = new WhereStatementController(this.getRelationStorage().getRelationModelStorage());

        this.processCallback(callback);
    }

    public has(key: string): boolean {
        if (this.relationStorage.getRelationModelStorage().getName() === key) {
            return true;
        }
        return this.whereStatementController.has(key);
    }

    public hasWhereHas(key?: string): boolean {
        if (!key) {
            return true;
        }
        if (key === this.relationStorage.getRelationModelStorage().getName()) {
            return true;
        }
        return this.whereStatementController.has(key);
    }

    public hasWhereHasComplicated(key: string): boolean {
        if (key === this.relationStorage.getRelationModelStorage().getName()) {
            return true;
        }
        return this.whereStatementController.has(key);
    }

    public hasWhereDoesntHave(key?: string): boolean {
        return this.getWhereStatementController().hasWhereDoesntHave(key);
    }

    public hasWhereDoesntHaveComplicated(key: string): boolean {
        return this.getWhereStatementController().hasWhereDoesntHaveComplicated(key);
    }


    public check(object: any): boolean {
        //todo maybe better primary key check / error?
        const primary_key = this.relationStorage.getModelStorage().getPrimaryKey();
        if (!object.hasOwnProperty(primary_key)) {
            return false;
        }

        if (!this.relationStorage.has(object[primary_key])) {
            return false
        }

        let relation = this.relationStorage.findByObject(object);

        if (this.relationStorage.getRelation().returnsMany()) {
            relation = this.whereStatementController.filter(relation);
            return (relation.length > 0);
        } else {
            return this.whereStatementController.check(relation);
        }
    }

    public filter(objects: any[]): any[] {
        return objects.filter((object: any) => {
            return this.check(object);
        })
    }

    public getWhereStatementController(): WhereStatementController {
        return this.whereStatementController;
    }

    public getRelationStorage(): RelationStorage {
        return this.relationStorage;
    }

    private processCallback(callback: WhereHasStatementCallback): void {
        new WhereHasStatementCallback(this, callback);
    }
}
