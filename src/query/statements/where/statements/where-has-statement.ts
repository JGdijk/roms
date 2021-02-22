import {WhereStatementInterface} from "../where-statement-interface";
import {RelationStorage} from "../../../../store/relation/relation-storage";



export class WhereHasStatement implements WhereStatementInterface {

    private relationStorage: RelationStorage;

    constructor(relationStorage: RelationStorage) {
        this.relationStorage = relationStorage;
    }

    public check(object: any): boolean {
        //todo maybe better primary key check / error?
        const primary_key = this.relationStorage.getModelStorage().getPrimaryKey();
        if (!object.hasOwnProperty(primary_key)) { return false; }

        return this.relationStorage.has(object[primary_key]);
    }

    public filter(objects: any[]): any[] {
        return objects.filter((objects: any) => {
            return this.check(objects);
        })
    }

    public has(key : string): boolean {
        return (this.relationStorage.getRelationModelStorage().getName() === key);
    }

    public hasWhereHas(key?: string): boolean {
        if (!key) { return true; }
        return !!(key === this.relationStorage.getRelationModelStorage().getName());
    }

    public hasWhereHasComplicated(key: string) { return false; }

    public hasWhereDoesntHave(key?: string): boolean { return false; }

    public hasWhereDoesntHaveComplicated(key: string): boolean { return false;}
}
