import {WhereStatementController} from "../where/where-statement-controller";
import {JoinStatementController} from "./join-statement-controller";
import {OrderByStatementController} from "../order/order-by-statement-controller";
import {RelationStorage} from "../../../store/relation/relation-storage";


export interface JoinStatementInterface {
    attach(object: any): void;
    has(key: string): boolean;
    getRelationStorage(): RelationStorage;
    hasStatements(): boolean;
    getStatements(): JoinStatementInterface[];
    hasWhereStatements(): boolean;
    getWhereStatementController(): WhereStatementController;
    hasOrderByStatements(): boolean;
    getOrderByStatementController(): OrderByStatementController;
    getJoinStatementController(): JoinStatementController;
}
