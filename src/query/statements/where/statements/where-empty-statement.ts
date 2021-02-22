import {WhereStatementInterface} from "../where-statement-interface";

export class WhereEmptyStatement implements WhereStatementInterface {

    private key: string;

    constructor(key: string) {
        this.key = key;
    }

    public check(object: any): boolean {
        if (!object.hasOwnProperty(this.key)) { return true; }
        if (object[this.key] === null) { return true; }
        if (object[this.key] === undefined) { return true; }
        if (object[this.key] === 0) { return true; }
        if (object[this.key] === 0.0) { return true; }
        if (object[this.key] === '') { return true; }
        if (object[this.key] === '0') { return true; }
        if (object[this.key] === false) { return true; }
        return !!(Array.isArray(object[this.key]) && object[this.key].length === 0);
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