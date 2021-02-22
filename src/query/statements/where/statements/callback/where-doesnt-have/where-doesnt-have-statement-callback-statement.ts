import {WhereStatementInterface} from "../../../where-statement-interface";
import {WhereDoesntHaveStatementCallback} from "./where-doesnt-have-statement-callback";
import {WhereStatementController} from "../../../where-statement-controller";
import {RelationStorage} from "../../../../../../store/relation/relation-storage";

export class WhereDoesntHaveStatementCallbackStatement implements WhereStatementInterface {

    private relationStorage: RelationStorage;

    private whereStatementController: WhereStatementController;

    constructor(relationStorage: RelationStorage, callback: any){
        this.relationStorage = relationStorage;

        this.whereStatementController = new WhereStatementController(this.getRelationStorage().getRelationModelStorage());

        this.processCallback(callback);
    }

    public has(key: string): boolean {
        if (this.getRelationStorage().getRelationModelStorage().getName() === key) { return true; }
        return this.getWhereStatementController().has(key);
    }

    public hasWhereHas(key?: string): boolean {
        return this.getWhereStatementController().hasWhereHas(key);
    }

    public hasWhereHasComplicated(key: string): boolean {
        return this.getWhereStatementController().hasWhereHasComplicated(key);
    }

    public hasWhereDoesntHave(key?: string): boolean {
        if (!key) { return true; }
        if (key === this.getRelationStorage().getRelationModelStorage().getName()) { return true; }
        return this.whereStatementController.has(key);
    }

    public hasWhereDoesntHaveComplicated(key: string): boolean {
        if (key === this.getRelationStorage().getRelationModelStorage().getName()) { return true; }
        return this.whereStatementController.has(key);
    }

    public check(object: any): boolean {

        //todo maybe better primary key check / error?
        const primary_key = this.relationStorage.getModelStorage().getPrimaryKey();
        if (!object.hasOwnProperty(primary_key)) { return false; }

        if (!this.relationStorage.has(object[primary_key])) { return true; }

        let relation = this.relationStorage.findByObject(object);

        if (this.relationStorage.getRelation().returnsMany()) {
            relation = this.whereStatementController.filter(relation);

            return (relation.length === 0);
        } else {
            return !this.whereStatementController.check(relation);
        }
    }

    public filter(objects: any[]): any[] {
        return objects.filter((objects: any) => {
            return this.check(objects);
        })
    }

    public getRelationStorage(): RelationStorage {
        return this.relationStorage;
    }

    public getWhereStatementController(): WhereStatementController {
        return this.whereStatementController;
    }

    processCallback(callback: WhereDoesntHaveStatementCallback): void {
        new WhereDoesntHaveStatementCallback(this, callback);
    }
}
