import {JoinStatementInterface} from "../join-statement-interface";
import {WhereStatementController} from "../../where/where-statement-controller";
import {JoinStatementController} from "../join-statement-controller";
import {OrderByStatementController} from "../../order/order-by-statement-controller";
import {RelationStorage} from "../../../../store/relation/relation-storage";

export class JoinStatement implements JoinStatementInterface {

    private relationStorage: RelationStorage;

    private orderByStatementController: OrderByStatementController;
    private whereStatementController: WhereStatementController; // todo those are not needed here but types explode when removed
    private joinStatementController: JoinStatementController; // todo those are not needed here but types explode when removed

    constructor(relationStorage: RelationStorage) {
        this.relationStorage = relationStorage;

        this.orderByStatementController = new OrderByStatementController(relationStorage.getRelationModelStorage().getPrimaryKey());
        this.whereStatementController = new WhereStatementController(relationStorage.getRelationModelStorage())
        this.joinStatementController = new JoinStatementController();
    }

    attach(object: any): void {
        Object.defineProperty(object, this.relationStorage.getKey(), {
            value: this.relationStorage.findByObject(object, true),
            enumerable: true
        });
    }

    has(key: string): boolean {
        return (key === this.relationStorage.getRelationModelStorage().getName());
    }

    getRelationStorage(): RelationStorage {
        return this.relationStorage;
    }

    hasStatements(): boolean {
        return false;
    }

    getStatements(): JoinStatementInterface[] {
        return [];
    }

    hasWhereStatements(): boolean {
        return false;
    }

    getWhereStatementController(): WhereStatementController{
        return this.whereStatementController;
    }

    hasOrderByStatements(): boolean {
        return false;
    }

    getOrderByStatementController(): OrderByStatementController {
        return this.orderByStatementController;
    }

    getJoinStatementController(): JoinStatementController{
        return this.joinStatementController;
    }
}
