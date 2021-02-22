import {WhereStatementInterface} from "../where-statement-interface";

export class WhereBetweenStatement implements WhereStatementInterface {

    private key: string;

    private low: number;

    private high: number;

    constructor(key: string, low: number, high: number) {
        this.key = key;
        this.low = low;
        this.high = high;
    }

    public check(object: any): boolean {

        if (!object.hasOwnProperty(this.key)) { return false; }

        return !!(object[this.key] >= this.low && object[this.key] <= this.high);
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