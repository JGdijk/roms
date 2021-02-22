import {PushController} from "../push-controller";
import {RemoveCollector} from "../../types/remove-collector";
import {JoinStatementInterface} from "../../../query/statements/join/join-statement-interface";

export class Remover {

    protected type: string;

    private keys: string[];

    private pushController: PushController;

    private collector: RemoveCollector;

    private checked: boolean;

    constructor(pushController: PushController) {
        this.type = 'remove';
        this.keys = [];
        this.checked = false;

        this.pushController = pushController;
        this.collector = this.pushController.getCollectorController().getRemoveCollector();
    }

    public run(): void {

        if (!this.hasKeys()) {
            return;
        }

        this.processTarget();

        this.processRelations();

        let data = null;

        if (this.checked) {
            if (this.pushController.getQueryData().getOrderByStatementController().has()) {
                data = this.pushController.getQueryData().getOrderByStatementController().order(this.pushController.getData());
            } else {
                data = this.pushController.getQueryData().getOrderByStatementController().orderDefault(this.pushController.getData());
            }

            this.pushController.setData(data);
        }
    }

    private processTarget(): void {
        const key = this.pushController.getQueryData().getModelStorage().getName();

        // if the collector doesn't contain any target data we can skip
        if (!this.collector.has(key)) {
            return;
        }

        let ids = this.collector.find(key);

        // filter out all the objects if ids are set
        if (this.pushController.getQueryData().hasIds()) {
            ids = this.filterIds(ids);
        }

        if (!ids.length) {
            return;
        }

        let check = false;
        const pk = this.pushController.getQueryData().getModelStorage().getPrimaryKey();

        const new_data = this.pushController.getData().filter((obj: any) => {
            for (const id of ids) {
                if (id === obj[pk]) {
                    check = true;
                    return false;
                }
            }
            return true;
        });

        if (check) {
            this.checked = true;
            this.pushController.setChecked();
            this.pushController.setData(new_data);
        }
    }

    private processRelations(): void {
        if (!this.pushController.getQueryData().getJoinStatementController().has()) {
            return;
        }

        const statements = this.pushController.getQueryData().getJoinStatementController().getStatements();

        let data = this.pushController.getData();

        let checked = false;
        let new_array = [];

        for (let object of data) {

            let new_model = null;

            for (const statement of statements) {
                const new_relation_data = this.checkRelationData(object[statement.getRelationStorage().getKey()], statement);

                if (new_relation_data !== false) {

                    if (!new_model) {
                        new_model = statement.getRelationStorage().getModelStorage().createModel(object);
                    }

                    Object.defineProperty(new_model, statement.getRelationStorage().getKey(), {
                        value: new_relation_data,
                        enumerable: true,
                    })
                    checked = true;
                }
            }

            if (new_model) {
                new_array.push(new_model);
            } else {
                new_array.push(object);
            }

        }


        if (checked) {
            this.checked = true;
            this.pushController.setChecked();
            this.pushController.setData(new_array);
        }
    }

    private checkRelationData(object: any, statement: JoinStatementInterface): any {
        if ((!statement.getRelationStorage().getRelation().returnsMany() && !object) ||
            statement.getRelationStorage().getRelation().returnsMany() && (!object || !object.length)) {
            return false;
        }

        return (Array.isArray(object))
            ? this.checkRelationDataArray(object, statement)
            : this.checkRelationDataObject(object, statement);
    }

    private checkRelationDataArray(objects: any[], statement: JoinStatementInterface): any[] | boolean {
        // todo if something is removed we have to check if a where has is still valid
        // todo or that a where doesn't have became valid.
        let ids_to_remove = this.collector.find(statement.getRelationStorage().getRelationModelStorage().getName());
        let checked = false;

        const pk = statement.getRelationStorage().getRelationModelStorage().getPrimaryKey();
        let new_relation_array = [];

        for (const object of objects) {

            if (ids_to_remove.includes(object[pk])) {
                checked = true;
                continue;
            }

            let new_object = null;

            for (const relationStatement of statement.getStatements()) {
                const new_relation_data = this.checkRelationData(object[relationStatement.getRelationStorage().getKey()], relationStatement);
                if (new_relation_data !== false) {

                    if (!new_object) {
                        new_object = relationStatement.getRelationStorage().getModelStorage().createModel(object);
                    }
                    Object.defineProperty(new_object, relationStatement.getRelationStorage().getKey(), {
                        value: new_relation_data,
                        enumerable: true,
                    })
                    checked = true;
                }
            }

            if (new_object) {
                new_relation_array.push(new_object);
            } else {
                new_relation_array.push(object);
            }
        }

        if (checked) {
            this.checked = true;
            this.pushController.setChecked();

            return (!statement.hasOrderByStatements())
                ? new_relation_array
                : statement.getOrderByStatementController().order(new_relation_array);
        } else {
            return false;
        }

    }

    private checkRelationDataObject(object: any, statement: JoinStatementInterface): any | boolean {
        let ids_to_remove = this.collector.find(statement.getRelationStorage().getRelationModelStorage().getName());
        const pk = statement.getRelationStorage().getRelationModelStorage().getPrimaryKey();

        if (ids_to_remove.includes(object[pk])) {
            this.checked = true;
            this.pushController.setChecked();
            return null;
        }

        if (!statement.hasStatements()) {
            return false;
        }

        let relation_checked = false;
        let new_object = null;

        const relationStatements = statement.getStatements();
        for (const relationStatement of relationStatements) {
            const new_relation_data =
                this.checkRelationData(object[relationStatement.getRelationStorage().getKey()], relationStatement);

            if (new_relation_data === false) {
                continue;
            }

            if (!new_object) {
                new_object = relationStatement.getRelationStorage().getModelStorage().createModel(object);
            }

            Object.defineProperty(new_object, relationStatement.getRelationStorage().getKey(), {
                value: new_relation_data,
                enumerable: true,
            })
            relation_checked = true;
        }

        return (relation_checked)
            ? new_object
            : false;
    }

    private hasKeys(): boolean {
        for (const key of this.collector.keys()) {
            if (this.pushController.getQueryData().has(key)) {
                this.keys.push(key);
            }
        }

        return !!(this.keys.length);
    }

    private filterIds(ids: any[]): number[] | string[] {

        return ids.filter((remove_id: number | string) => {
            for (const id of this.pushController.getQueryData().getIds()) {
                if (id === remove_id) {
                    return true;
                }
            }
            return false;
        })
    }
}
