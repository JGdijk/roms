import {WhereStatementInterface} from "../where-statement-interface";
import {RelationStorage} from "../../../../store/relation/relation-storage";


// todo do we need this class?
export class WhereNoneHaveStatement implements WhereStatementInterface {

    private relationStorage: RelationStorage;

    constructor(relationStorage: RelationStorage) {
        this.relationStorage = relationStorage;
    }

    public check(object: any): boolean {
        //todo maybe better primary key check / error?
        const primary_key = this.relationStorage.getModelStorage().getPrimaryKey();

        if (!object.hasOwnProperty(primary_key)) { return false; }

        return !this.relationStorage.has(object[primary_key]);
    }

    public filter(objects: any[]): any[] {
        for (const object of objects) {
            if (!this.check(object)) { return []; }
        }
        return objects;
    }

    public has(key : string): boolean {
        return (this.relationStorage.getRelationModelStorage().getName() === key);
    }

    public hasWhereHas(key?: string): boolean { return false; }

    public hasWhereHasComplicated(key: string) { return false; }

    public hasWhereDoesntHave(key?: string): boolean {
        // we have to return true here because
        return true;
    }

    public hasWhereDoesntHaveComplicated(key: string): boolean { return false;}


}
