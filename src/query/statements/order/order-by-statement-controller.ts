import {OrderByStatement} from "./order-by-statement";

export class OrderByStatementController {

    private statements: any[];

    private default_statement: OrderByStatement;

    constructor(default_key: string) {
        this.statements = [];
        this.default_statement = new OrderByStatement(default_key, 'asc'); // todo why default is a thing?
    }

    public add(statement: any): void {
        this.statements.push(statement);
    }

    public has(): boolean {
        return (this.statements.length > 0);
    }

    public order(objects: any[]): any[] {
        for (const statement of this.statements) {
            objects = statement.order(objects);
        }
        return objects;
    }

    public orderDefault(objects: any[]): any[] {
        return this.default_statement.order(objects);
    }
}
