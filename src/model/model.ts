import {QueryStarter} from "../query/query-starter";

export class Model {

    // todo we probably want a specific class for all queries directly to the model also for the "queryRelation" functionality.
    private __queryStarter: any;
    private __primaryKey: any;

    constructor(data: unknown, queryStarter: QueryStarter, primaryKey: number) {
        Object.assign(this, data);

        Object.defineProperties(this, {
            ['__queryStarter']: {
                enumerable: false,
                get: function () {
                   return queryStarter;
                },
                set: function () {
                    throw 'setting not allowed'
                }
            }
        })
        Object.defineProperties(this, {
            ['__primaryKey']: {
                enumerable: false,
                get: function () {
                    return primaryKey;
                },
                set: function () {
                    throw 'setting not allowed'
                }
            }
        })
    }

    public update(data: unknown): void {
        // @ts-ignore todo
        this.__queryStarter.update(data, this[this.__primaryKey]);
    }

    public remove(): void {
        // @ts-ignore todo
        this.__queryStarter.remove(this[this.__primaryKey]);
    }

    public attach(relation: string, ids?: number | string | number[] | string[]): void {
        const ids_array: any = (!Array.isArray(ids)) ? [ids] : ids;
        // @ts-ignore todo
        this.__queryStarter.attach(this[this.__primaryKey], relation, ids_array);
    }

    public detach(relation: string, ids?: number | string | number[] | string[]): void {
        const ids_array: any = (!Array.isArray(ids)) ? [ids] : ids;
        // @ts-ignore todo
        this.__queryStarter.attach(this[this.__primaryKey], relation, ids_array);
    }

    public addRelation(relation: string, object: any | any[]): void {

        // --------------------

        this.__queryStarter.modelStorage.relationStorageContainer.hasKey(relation);

        const relation_model_name = this.__queryStarter.modelStorage
            .find(relation)
            .getRelationModelStorage()
            .getName();
        const relation_pk = this.__queryStarter.modelStorage
            .find(relation)
            .getRelationModelStorage()
            .getPrimaryKey();

        const objects_array: any = (!Array.isArray(object)) ? [object] : object;

        this.__queryStarter.romsController.holdInternally();

        this.__queryStarter.romsController.add(relation_model_name, objects_array);

        let relation_ids = [];

        for (const relation_object of objects_array) {

            if (!relation_object.hasOwnProperty(relation_pk)) {
                // todo maybe error?
                continue;
            }
            relation_ids.push(relation_object[relation_pk]);
        }

        this.__queryStarter.romsController.attach(
            this.__queryStarter.modelStorage.getName(),
            relation,
            // @ts-ignore todo
            [this[this.__primaryKey]],
            relation_ids
        )

        this.__queryStarter.romsController.continueInternally();
    }

}
