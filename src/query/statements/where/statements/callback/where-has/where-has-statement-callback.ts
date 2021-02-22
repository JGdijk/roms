import {WhereHasStatementCallbackStatement} from "./where-has-statement-callback-statement";
import {WhereStatement} from "../../where-statement";
import {WhereStatementCallbackStatement} from "../where/where-statement-callback-statement";
import {WhereHasStatement} from "../../where-has-statement";
import {WhereDoesntHaveStatement} from "../../where-doesnt-have-statement";
import {WhereDoesntHaveStatementCallbackStatement} from "../where-doesnt-have/where-doesnt-have-statement-callback-statement";
import {WhereBetweenStatement} from "../../where-between-statement";
import {WhereNotBetweenStatement} from "../../where-not-between-statement";
import {WhereInStatement} from "../../where-in-statement";
import {WhereNotInStatement} from "../../where-not-in-statement";

export class WhereHasStatementCallback {

    private statement: WhereHasStatementCallbackStatement;

    constructor(statement: WhereHasStatementCallbackStatement, callback: any){
        this.statement = statement;
        callback(this);
    }

    public where(key: string | any , action?: string, value?: string|number): WhereHasStatementCallback {
        if (action) {
            this.statement.getWhereStatementController().add(new WhereStatement(key, action, value));
        } else {
            this.statement.getWhereStatementController().add(new WhereStatementCallbackStatement(key, this.statement.getRelationStorage().getRelationModelStorage()));
        }
        return this;
    }

    public orWhere(key: string | any , action?: string, value?: string|number): WhereHasStatementCallback {
        if (action) {
            this.statement.getWhereStatementController().addNewBag(new WhereStatement(key, action, value));
        } else {
            this.statement.getWhereStatementController().addNewBag(new WhereStatementCallbackStatement(key, this.statement.getRelationStorage().getRelationModelStorage()));
        }
        return this;
    }

    public whereBetween(key: string, low: number, high: number): WhereHasStatementCallback {
        this.statement.getWhereStatementController().add(new WhereBetweenStatement(key, low, high));
        return this;
    }

    public whereNotBetween(key: string, low: number, high: number): WhereHasStatementCallback {
        this.statement.getWhereStatementController().add(new WhereNotBetweenStatement(key, low, high));
        return this;
    }

    public whereIn(key: string, values: number[] | string[]): WhereHasStatementCallback {
        this.statement.getWhereStatementController().add(new WhereInStatement(key, values));
        return this;
    }

    public whereNotIn(key: string, values: number[] | string[]): WhereHasStatementCallback {
        this.statement.getWhereStatementController().add(new WhereNotInStatement(key, values));
        return this;
    }

    public whereHas(key: string, callback?: any): WhereHasStatementCallback {
        //todo checks if relation is not found
        const relation = this.statement.getRelationStorage();

        if (callback) {
            this.statement.getWhereStatementController().add(new WhereHasStatementCallbackStatement(relation, callback));
        } else {
            this.statement.getWhereStatementController().add(new WhereHasStatement(relation));
        }

        return this;
    }

    public whereDoesntHave(key: string, callback?: any): WhereHasStatementCallback {
        //todo checks if relation is not found
        const relation = this.statement.getRelationStorage();

        if (callback) {
            this.statement.getWhereStatementController().add(new WhereDoesntHaveStatementCallbackStatement(relation, callback));
        } else {
            this.statement.getWhereStatementController().add(new WhereDoesntHaveStatement(relation));
        }

        return this;
    }

    // public whereNoneHave(key: string, callback?: any): WhereHasStatementCallback {
    //     const relation = this.statement.getRelation().getRelationObject().getRelationContainer().findByObjectName(key);
    //
    //     if (callback) {
    //         // this.statement.getWhereStatementController().add(new WhereDoesntHaveStatementCallbackStatement(relation, callback))
    //     } else {
    //         this.statement.getWhereStatementController().add(new WhereNoneHaveStatement(relation));
    //     }
    //
    //     return this;
    // }

}
