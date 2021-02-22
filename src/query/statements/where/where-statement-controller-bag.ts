import {WhereStatementInterface} from "./where-statement-interface";

export class WhereStatementControllerBag {

    statements: any[];

    constructor() {
        this.statements = [];
    }

    public add(statement: WhereStatementInterface): void {
        this.statements.push(statement);
    }

    public has(key?: string): boolean {
        if (!key) {
            return (this.statements.length > 0);
        }

        for (const statement of this.statements) {
            if (statement.has(key)) { return true; }
        }
        return false;
    }

    public hasWhereHas(key?: string): boolean {
        for (const statement of this.statements) {
            if (statement.hasWhereHas(key)) { return true; }
        }
        return false;
    }

    public hasWhereHasComplicated(key?: string): boolean {
        for (const statement of this.statements) {
            if (statement.hasWhereHasComplicated(key)) { return true; }
        }
        return false;
    }

    public hasWhereDoesntHave(key?: string): boolean {
        for (const statement of this.statements) {
            if (statement.hasWhereDoesntHave(key)) { return true; }
        }
        return false;
    }

    public hasWhereDoesntHaveComplicated(key?: string): boolean {
        for (const statement of this.statements) {
            if (statement.hasWhereDoesntHaveComplicated(key)) { return true; }
        }
        return false;
    }

    public filter(objects: any[]): any[] {
        for (const statement of this.statements) {
            objects = statement.filter(objects);
        }
        return objects;
    }

    public check(object: any): boolean {

        for (const statement of this.statements) {
            if (!statement.check(object)) { return false; }
        }

        return true;
    }

}
