import {PushController} from "../push-controller";
import {AttachCollector} from "../../types/attach-collector";
import {WhereStatementController} from "../../../query/statements/where/where-statement-controller";
import {JoinStatementInterface} from "../../../query/statements/join/join-statement-interface";

export class Attacher {

    protected type: string;

    readonly keys: string[];

    private pushController: PushController;

    private collector: AttachCollector;

    private checked: boolean;

    constructor(pushController: PushController) {
        this.type = 'attach';
        this.keys = [];
        this.checked = false;

        this.pushController = pushController;
        this.collector = pushController.getCollectorController().getAttachCollector();
    }

    public run(): void {

        if (!this.hasKeys()) {
            return;
        }

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
            !this.pushController.getQueryData().getWhereStatementController().hasWhereDoesntHave()) {
            return;
        }

        const has_where_has =
            this.checkWhereHasByKeys(this.pushController.getQueryData().getWhereStatementController());
        const has_where_doesnt_have =
            this.checkWhereDoesntHaveByKeys(this.pushController.getQueryData().getWhereStatementController());

        // If non of the complicated Where has or where doesn't have statement have any of the keys we can return.
        if (!has_where_has && !has_where_doesnt_have) {
            return;
        }

        // We will check if we now have to EXCLUDE data according to the changed relations.
        if (has_where_doesnt_have) {
            let data = this.pushController.getData();
            let filtered_data = this.pushController.getQueryData().getWhereStatementController().filter(data);

            if (filtered_data.length !== data.length) {
                this.checked = true;
                this.pushController.setChecked();
                this.pushController.setData(filtered_data);
            }
        }

        // We will check if we have to now INCLUDE any of the changed data.
        if (has_where_has) {
            let checked;

            let all_objects = this.pushController.getQueryData().getModelStorage().get();
            all_objects = this.pushController.getQueryData().getWhereStatementController().filter(all_objects);

            if (!all_objects.length) {
                return;
            }

            let data = this.pushController.getData();

            // If all the array of objects is the same length as it should be we can return.
            if (data.length === all_objects.length) {
                return;
            }

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
                    const statements = this.pushController.getQueryData().getJoinStatementController().getStatements();
                    for (const statement of statements) {
                        statement.attach(new_model);
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


        for (let relationObject of object[statement.getRelationStorage().getKey()]) {

            // We check if the object should now be EXCLUDED.
            if (has_where_doesnt_have) {
                if (!statement.getWhereStatementController().check(relationObject)) {
                    checked = true;
                    continue;
                }
            }

            let new_model = null;

            // We check the nested relations.
            if (statement.hasStatements()) {
                const relationStatements = statement.getStatements();
                for (const relationStatement of relationStatements) {

                    // If a relation doesn't contain any of the collector keys in either the joinStatement or
                    // whereStatement we can continue.
                    // if (!this.relationHasKeys(relationStatement)) { continue; } // todo this isn't working, we need to check for both object name as relation name, not only relation name.

                    const new_relation_data = this.checkRelationData(relationObject, relationStatement);

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

        // Now we can check if the collector has relationObjects for us to attach to this object.
        const local_pk = statement.getRelationStorage().getModelStorage().getPrimaryKey();
        const relation_ids_to_attach = this.collector.find(
            statement.getRelationStorage().getModelStorage().getName(),
            object[local_pk],
            statement.getRelationStorage().getRelationModelStorage().getName()
        );

        if (relation_ids_to_attach.length) {
            let new_relation_objects = statement.getRelationStorage().getRelationModelStorage().find(relation_ids_to_attach);
            if (statement.hasWhereStatements()) {
                new_relation_objects = statement.getWhereStatementController().filter(new_relation_objects);
            }
            if (new_relation_objects.length) {
                checked = true;
                for (const new_relation_object_orignal of new_relation_objects) {

                    let new_model = statement.getRelationStorage().getRelationModelStorage().createModel(new_relation_object_orignal);

                    if (statement.hasStatements()) {
                        statement.getJoinStatementController().attach(new_model)
                    }
                    new_array.push(new_model);
                }
            }
        }

        // We also have to check if the relation has a where has statement that might now INCLUDE relations that
        // were not in the array before.

        if (has_where_has) {
            const all_relations = statement.getRelationStorage().findByObject(object);
            const filtered_all_relations = statement.getWhereStatementController().filter(all_relations);

            // if both arrays have the same length we are done
            if (filtered_all_relations.length !== new_array.length) {

                const pk = statement.getRelationStorage().getRelationModelStorage().getPrimaryKey();

                let new_items = [];
                relationLoop: for (const relation of filtered_all_relations) {
                    for (const included_object of new_array) {
                        if (relation[pk] === included_object[pk]) {
                            continue relationLoop;
                        }
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

        if (!checked) {
            return false;
        }

        return (!statement.hasOrderByStatements())
            ? new_array // todo default order
            : statement.getOrderByStatementController().order(new_array);
    }


    private checkRelationDataObject(object: any, statement: JoinStatementInterface): any | boolean {

        let relationObject = object[statement.getRelationStorage().getKey()];

        if (relationObject) {
            // We check if the object should now be EXCLUDED according to a where doesn't have statement.
            if (statement.hasWhereStatements() && this.checkWhereDoesntHaveByKeys(statement.getWhereStatementController())) {
                if (!statement.getWhereStatementController().check(relationObject)) {
                    return null;
                }
            }

            // We check the nested relations.
            if (statement.hasStatements()) {

                let new_model = null;

                const relationStatements = statement.getStatements();
                for (const relationStatement of relationStatements) {

                    // If a relation doesn't contain any of the collector keys in either the joinStatement or
                    // whereStatement we can continue.
                    // if (!this.relationHasKeys(relationStatement)) { continue; } // todo this isn't working, we need to check for both object name as relation name, not only relation name.

                    const new_relation_data = this.checkRelationData(relationObject, relationStatement);
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
                if (new_model) {
                    return new_model;
                }
            }
        }

        if (!relationObject) {

            const local_pk = statement.getRelationStorage().getModelStorage().getPrimaryKey();

            // We check if the collector has ids for this object.
            const ids_to_attach = this.collector.find(
                statement.getRelationStorage().getModelStorage().getName(),
                object[local_pk],
                statement.getRelationStorage().getRelationModelStorage().getName()
            );

            if (ids_to_attach.length) {
                let objects_to_attach = statement.getRelationStorage().getRelationModelStorage().find(ids_to_attach);
                if (statement.hasWhereStatements()) {
                    objects_to_attach = statement.getWhereStatementController().filter(objects_to_attach);
                }

                if (objects_to_attach.length) {

                    let new_model = statement.getRelationStorage().getRelationModelStorage().createModel(objects_to_attach[0]);

                    if (statement.hasStatements()) {
                        statement.getJoinStatementController().attach(new_model)
                    }
                    return new_model;
                }
            }

            // we check if there was a nested where has statement that might now INCLUDE a relation
            if (statement.hasWhereStatements() && this.checkWhereHasByKeys(statement.getWhereStatementController())) {
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
        }

        return false;
    }


    private relationHasKeys(statement: JoinStatementInterface): boolean {
        for (const key of this.collector.keys()) {
            if (statement.has(key)) {
                return true;
            }
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
