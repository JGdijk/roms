import {WhereStatementInterface} from "../where-statement-interface";

export class WhereExistsStatement implements WhereStatementInterface {

    private key: string;

    constructor(key: string) {
        this.key = key;
    }

    public check(object: any): boolean {
        return !!(object.hasOwnProperty(this.key));
    }

    public filter(objects: any[]): any[] {
        return objects.filter((objects: any) => {
            return this.check(objects);
        })
    }

    public has(key : string): boolean { return false; }

    public hasWhereHas(key?: string): boolean { return false; }

    public hasWhereHasComplicated(key: string) { return false; }

    public hasWhereDoesntHave(key?: string): boolean { return false; }

    public hasWhereDoesntHaveComplicated(key: string): boolean { return false;}
}