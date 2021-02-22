import {PushController} from "../push-controller";
import {DetachCollector} from "../../types/detach-collector";
import {JoinStatementInterface} from "../../../query/statements/join/join-statement-interface";
import {WhereStatementController} from "../../../query/statements/where/where-statement-controller";

export class Detacher {

    protected type: string;

    readonly keys: string[];

    private pushController: PushController;

    private collector: DetachCollector;

    private checked: boolean;

    constructor(pushController: PushController) {
        this.type = 'detach';
        this.keys = [];
        this.checked = false;

        this.pushController = pushController;
        this.collector = this.pushController.getCollectorController().getDetachCollector();
    }

    public run(): void {
        if (!this.hasKeys()) { return; }

        this.processRelations();

        this.processTarget();

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

        if (!this.pushController.getQueryData().getWhereStatementController().hasWhereHas() &&
            !this.pushController.getQueryData().getWhereStatementController().hasWhereDoesntHave()) { return; }

        const has_where_has =
            this.checkWhereHasByKeys(this.pushController.getQueryData().getWhereStatementController());
        const has_where_doesnt_have =
            this.checkWhereDoesntHaveByKeys(this.pushController.getQueryData().getWhereStatementController());

        // If non of the complicated Where has or where doesn't have statement have any of the keys we can return.
        if (!has_where_has && !has_where_doesnt_have) { return; }

        // We will check if we now have to EXCLUDE data according to the changed relations.
        if (has_where_has) {
            let data = this.pushController.getData();
            let filtered_data = this.pushController.getQueryData().getWhereStatementController().filter(data);

            if (filtered_data.length !== data.length) {
                this.checked = true;
                this.pushController.setChecked();
                this.pushController.setData(filtered_data);
            }
        }

        // We will check if we have to now INCLUDE any of the changed data.
        if (has_where_doesnt_have) {
            let checked;

            let all_objects = this.pushController.getQueryData().getModelStorage().get();
            all_objects = this.pushController.getQueryData().getWhereStatementController().filter(all_objects);

            if (!all_objects.length) { return; }

            let data = this.pushController.getData();

            if (data.length === all_objects.length) { return; }

            const pk = this.pushController.getQueryData().getModelStorage().getPrimaryKey();

            newLoop: for (const new_object of all_objects) {
                for (const old_object of data) {
                    if (new_object[pk] === old_object[pk]) {
                        continue newLoop;
                    }
                }

                checked = true;

                let new_model = this.pushController.getQueryData().getModelStorage().createModel(new_object);

                if (this.pushController.getQueryData().getJoinStatementController().has()) {
                    // todo make it that statement can return joinStatementController
                    for (const nestedStatement of this.pushController.getQueryData().getJoinStatementController().getStatements()) {
                        nestedStatement.attach(new_model);
                    }
                }
                data.push(new_model);
            }

            if (checked) {
                this.checked = true;
                this.pushController.setChecked();
                this.pushController.setData(data);
            }
        }
    }

    private processRelations() {
        if (!this.pushController.getQueryData().getJoinStatementController().has()) { return; }

        const statements = this.pushController.getQueryData().getJoinStatementController().getStatements();

        let data = this.pushController.getData();

        let checked = false;
        let new_array = [];

        for (let object of data) {

            let new_model = null;

            for (const statement of statements) {

                // If a relation doesn't contain any of the collector keys in either the joinStatement or whereStatement
                // we can continue;
                // if (!this.relationHasKeys(statement)) { continue; } // todo this isn't working, we need to check for both object name as relation name, not only relation name.

                const new_relation_data = this.checkRelationData(object, statement);

                if (new_relation_data !== false) {

                    if (!new_model) {
                        new_model = statement.getRelationStorage().getModelStorage().createModel(object);
                    }

                    Object.defineProperty(new_model, statement.getRelationStorage().getKey(), {
                        value: new_relation_data,
                        enumerable: true
                    })
                    // new_model[statement.getRelation().getObjectName()] = new_relation_data;

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

    private checkRelationData(object: any, statement: JoinStatementInterface): any | boolean {

        return (object === null || !statement.getRelationStorage().getRelation().returnsMany())
            ? this.checkRelationDataObject(object, statement)
            : this.checkRelationDataArray(object, statement);
    }

    private checkRelationDataArray(object: any, statement: JoinStatementInterface): any[] | boolean {
        let checked = false;
        let new_array = [];

        const has_where_has = (!statement.hasWhereStatements()) ? false :
            (this.checkWhereHasByKeys(statement.getWhereStatementController()));
        const has_where_doesnt_have = (!statement.hasWhereStatements()) ? false :
            (this.checkWhereDoesntHaveByKeys(statement.getWhereStatementController()));

        // We collect the ids that have to be removed from this relation array.
        const local_pk = statement.getRelationStorage().getModelStorage().getPrimaryKey();
        const pk = statement.getRelationStorage().getRelationModelStorage().getPrimaryKey();

        let relation_ids_to_detach: any = this.collector.find( // todo type conflict later on.
            statement.getRelationStorage().getModelStorage().getName(),
            object[local_pk],
            statement.getRelationStorage().getRelationModelStorage().getName()
        );
        if (relation_ids_to_detach.length) {
            if (statement.hasWhereStatements()) {
                let objects_to_detach = statement.getRelationStorage().getRelationModelStorage().find(relation_ids_to_detach);
                objects_to_detach = statement.getWhereStatementController().filter(objects_to_detach);
                relation_ids_to_detach = objects_to_detach.map((obj: any) => obj[pk]); // todo type
            }
        }


        for (let relationObject of object[statement.getRelationStorage().getKey()]) {


            // We check if the object should now be EXCLUDED because it has a where has statement.
            if (has_where_has) {
                if (!statement.getWhereStatementController().check(relationObject)) {
                    checked = true;
                    continue;
                }
            }

            // Exclude the relationObject if it is in the array with ids to remove.
            if (relation_ids_to_detach.includes(relationObject[pk])) {
                checked = true;
                continue;
            }

            // We check the nested relations if any.
            let new_model = null;

            // We check the nested relations.
            if (statement.hasStatements()) {
                const relationStatements = statement.getStatements();
                for (const relationStatement of relationStatements) {

                    // If a relation doesn't contain any of the collector keys in either the joinStatement or
                    // whereStatement we can continue.
                    // if (!this.relationHasKeys(relationStatement)) { continue; } // todo this isn't working, we need to check for both object name as relation name, not only relation name.

                    const new_relation_data =
                        this.checkRelationData(relationObject, relationStatement);
                    if (new_relation_data !== false) {
                        if (!new_model) {
                            new_model = relationStatement.getRelationStorage().getModelStorage().createModel(relationObject);
                        }
                        Object.defineProperty(new_model, relationStatement.getRelationStorage().getKey(), {
                            value: new_relation_data,
                            enumerable: true,
                        })
                    }
                }
            }

            if (new_model) {
                checked = true;
                new_array.push(new_model);
            } else {
                new_array.push(relationObject);
            }
        }

        // We check if the relation has a where doesn't have statement that might now INCLUDE new relations.
        if (has_where_doesnt_have) {
            const all_relations = statement.getRelationStorage().findByObject(object);
            const filtered_all_relations = statement.getWhereStatementController().filter(all_relations);

            // If both arrays have the same length we are done.
            if (filtered_all_relations.length !== new_array.length) {

                let new_items = [];
                relationLoop: for (const relation of filtered_all_relations) {
                    for (const included_object of new_array) {
                        if (relation[pk] === included_object[pk]) { continue relationLoop; }
                    }

                    checked = true;
                    let new_model = statement.getRelationStorage().getRelationModelStorage().createModel(relation);
                    if (statement.hasStatements()) {
                        statement.getJoinStatementController().attach(new_model)
                    }
                    new_items.push(new_model);
                }
                new_array = [...new_array, ...new_items];
            }
        }

        if (!checked) { return false; }

        return (!statement.hasOrderByStatements())
            ? new_array // todo default order
            : statement.getOrderByStatementController().order(new_array);
    }

    private checkRelationDataObject(object: any, statement: JoinStatementInterface): any | boolean {

        let relationObject = object[statement.getRelationStorage().getKey()];

        const local_pk = statement.getRelationStorage().getRelationModelStorage().getPrimaryKey();

        if (relationObject) {

            // we check if the collector has any ids
            let relation_ids_to_detach: any = this.collector.find( // todo type conflict later on.
                statement.getRelationStorage().getModelStorage().getName(),
                object[local_pk],
                statement.getRelationStorage().getRelationModelStorage().getName()
            );

            // It's a single relation if there is a result it needs to be detached
            if (relation_ids_to_detach.length) { return null; }


            // We check if the object should now be EXCLUDED because it has a where has statement.
            if (statement.hasWhereStatements() && this.checkWhereHasByKeys(statement.getWhereStatementController())) {
                if (!statement.getWhereStatementController().check(relationObject)) { return null; }
            }

            // We check the nested relations if any.
            let new_model = null;

            // We check the nested relations.
            if (statement.hasStatements()) {
                const relationStatements = statement.getStatements();
                for (const relationStatement of relationStatements) {

                    // If a relation doesn't contain any of the collector keys in either the joinStatement or
                    // whereStatement we can continue.
                    // if (!this.relationHasKeys(relationStatement)) { continue; } // todo this isn't working, we need to check for both object name as relation name, not only relation name.

                    const new_relation_data =
                        this.checkRelationData(relationObject, relationStatement);
                    if (new_relation_data !== false) {
                        if (!new_model) {
                            new_model = relationStatement.getRelationStorage().getModelStorage().createModel(relationObject);
                        }
                        Object.defineProperty(new_model, relationStatement.getRelationStorage().getKey(), {
                            value: new_relation_data,
                            enumerable: true,
                        })
                    }
                }
            }

            return (new_model)
                ? new_model
                : false;
        }

        if (!relationObject) {

            // we check if there was a nested where doesnt have statement that might now INCLUDE a relation
            if (statement.hasWhereStatements() && this.checkWhereDoesntHaveByKeys(statement.getWhereStatementController())) {
                let all_relation_objects = statement.getRelationStorage().findByObject(object);

                if (all_relation_objects) {
                    if (statement.getWhereStatementController().check(all_relation_objects)) {

                        let new_model = statement.getRelationStorage().getRelationModelStorage().createModel(all_relation_objects);

                        if (statement.hasStatements()) {
                            statement.getJoinStatementController().attach(new_model)
                        }
                        return new_model;
                    }
                }
            }

            return false;
        }
    }

    private relationHasKeys(statement: JoinStatementInterface): boolean {
        for (const key of this.collector.keys()) {
            if (statement.has(key)) { return true; }
        }
        return false;
    }

    private hasKeys(): boolean {
        for (const key of this.collector.keys()) {
            if (this.pushController.getQueryData().has(key)) {
                this.keys.push(key);
            }
        }
        return !!(this.keys.length);
    }

    private checkWhereHasByKeys(controller: WhereStatementController): boolean {
        return true;
        //todo check why this doesn't work
        // for (const key of this.keys) {
        //     if (controller.hasWhereHas(key)) { return true; }
        // }
        // return false;
    }

    private checkWhereDoesntHaveByKeys(controller: WhereStatementController): boolean {
        return true;
        //todo check why this doesn't work
        // for (const key of this.keys) {
        //     if (controller.hasWhereDoesntHave(key)) { return true; }
        // }
        // return false;
    }
}
