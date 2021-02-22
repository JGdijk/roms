import {JoinStatement} from "./statements/join-statement";
import {JoinCallbackStatement} from "./statements/callback/join-callback-statement";
import {JoinStatementInterface} from "./join-statement-interface";

export class JoinStatementController {

    private statements: JoinStatementInterface[];

    constructor() {
        this.statements = [];
    }

    public add(statement: JoinStatement | JoinCallbackStatement): void { // todo change type
        this.statements.push(statement);
    }

    public has(key?: string): boolean {
        if (!key) {
            return !!(this.statements.length);
        }

        for (const statement of this.statements) {
            if (statement.has(key)) { return true; }
        }
        return false;
    }

    public attach(object: any): void {
        for (const statement of this.statements) {
            statement.attach(object);
        }
    }

    public attachMany(objects: any[]): void {
        for (const object of objects) {
            this.attach(object);
        }
    }

    // public getRelations(): Relation[] { todo not used?
    //     let relations = [];
    //     for (const statement of this.statements) {
    //         relations.push(statement.getRelation());
    //     }
    //     return relations;
    // }

    public getStatements(): JoinStatementInterface[] {
        return this.statements;
    }

}
