import {WhereStatementInterface} from "../where-statement-interface";

export class WhereNotInStatement implements WhereStatementInterface {

    private key: string;

    private values: number[] & string[];

    constructor(key: string, values: any[]) {
        this.key = key;
        this.values = values;
    }

    public check(object: any): boolean {
        if (!object.hasOwnProperty(this.key)) { return false; }

        return !(this.values.includes(object[this.key]))
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