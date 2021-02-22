import {JoinCallbackStatement} from "./join-callback-statement";
import {WhereStatement} from "../../../where/statements/where-statement";
import {JoinStatement} from "../join-statement";
import {WhereStatementCallbackStatement} from "../../../where/statements/callback/where/where-statement-callback-statement";
import {WhereBetweenStatement} from "../../../where/statements/where-between-statement";
import {WhereNotBetweenStatement} from "../../../where/statements/where-not-between-statement";
import {WhereInStatement} from "../../../where/statements/where-in-statement";
import {WhereNotInStatement} from "../../../where/statements/where-not-in-statement";
import {WhereHasStatementCallbackStatement} from "../../../where/statements/callback/where-has/where-has-statement-callback-statement";
import {WhereHasStatement} from "../../../where/statements/where-has-statement";
import {WhereDoesntHaveStatementCallbackStatement} from "../../../where/statements/callback/where-doesnt-have/where-doesnt-have-statement-callback-statement";
import {WhereDoesntHaveStatement} from "../../../where/statements/where-doesnt-have-statement";
import {OrderByStatement} from "../../../order/order-by-statement";

export class JoinCallback {

    private statement: JoinCallbackStatement;

    constructor(statement: JoinCallbackStatement, callback: any) {
        this.statement = statement;
        callback(this);
    }

    public where(key: string | any, action: string, value?: string | number): JoinCallback {
        if (action) {
            this.statement.getWhereStatementController().add(new WhereStatement(key, action, value));
        } else {
            this.statement.getWhereStatementController().add(new WhereStatementCallbackStatement(key, this.statement.getRelationStorage().getRelationModelStorage()));
        }
        return this;
    }

    public orWhere(key: string | any, action?: string, value?: string | number): JoinCallback {
        if (action) {
            this.statement.getWhereStatementController().addNewBag(new WhereStatement(key, action, value));
        } else {
            this.statement.getWhereStatementController().addNewBag(new WhereStatementCallbackStatement(key, this.statement.getRelationStorage().getRelationModelStorage()));
        }
        return this;
    }

    public whereBetween(key: string, low: number, high: number): JoinCallback {
        this.statement.getWhereStatementController().add(new WhereBetweenStatement(key, low, high));
        return this;
    }

    public whereNotBetween(key: string, low: number, high: number): JoinCallback {
        this.statement.getWhereStatementController().add(new WhereNotBetweenStatement(key, low, high));
        return this;
    }

    public whereIn(key: string, values: number[] | string[]): JoinCallback {
        this.statement.getWhereStatementController().add(new WhereInStatement(key, values));
        return this;
    }

    public whereNotIn(key: string, values: number[] | string[]): JoinCallback {
        this.statement.getWhereStatementController().add(new WhereNotInStatement(key, values));
        return this;
    }

    public whereHas(key: string, callback?: any): JoinCallback {
        //todo checks if relation is not found
        const relation = this.statement.getRelationStorage().getRelationModelStorage().getRelationStorageContainer().find(key);

        if (callback) {
            this.statement.getWhereStatementController().add(new WhereHasStatementCallbackStatement(relation, callback));
        } else {
            this.statement.getWhereStatementController().add(new WhereHasStatement(relation));
        }

        return this;
    }

    public whereDoesntHave(key: string, callback?: any): JoinCallback {
        //todo checks if relation is not found
        const relation = this.statement.getRelationStorage().getRelationModelStorage().getRelationStorageContainer().find(key);

        if (callback) {
            this.statement.getWhereStatementController().add(new WhereDoesntHaveStatementCallbackStatement(relation, callback));
        } else {
            this.statement.getWhereStatementController().add(new WhereDoesntHaveStatement(relation));
        }

        return this;
    }

    public with(name: string | string[], callback?: any): JoinCallback { //todo fix type
        if (callback && !Array.isArray(name)) {
            if (!this.statement.getRelationStorage().getRelationModelStorage().getRelationStorageContainer().find(name)) {
                return this;
            }
            const relation = this.statement.getRelationStorage().getRelationModelStorage().getRelationStorageContainer().find(name);
            this.statement.getJoinStatementController().add(new JoinCallbackStatement(relation, callback))
        } else {
            if (!Array.isArray(name)) {
                if (!this.statement.getRelationStorage().getRelationModelStorage().getRelationStorageContainer().find(name)) {
                    return this;
                }
                const relation = this.statement.getRelationStorage().getRelationModelStorage().getRelationStorageContainer().find(name);
                this.statement.getJoinStatementController().add(new JoinStatement(relation));
            } else {
                for (const v of name) {
                    if (!this.statement.getRelationStorage().getRelationModelStorage().getRelationStorageContainer().find(v)) {
                        return this;
                    }
                    const relation = this.statement.getRelationStorage().getRelationModelStorage().getRelationStorageContainer().find(v);
                    this.statement.getJoinStatementController().add(new JoinStatement(relation));
                }
            }
        }
        return this;
    }

    public orderBy(key: string, order?: 'asc' | 'desc'): JoinCallback {
        this.statement.getOrderByStatementController().add(new OrderByStatement(key, order));
        return this;
    }


}
