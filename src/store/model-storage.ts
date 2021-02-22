import {RomsController} from "../roms/roms-controller";
import {RelationStorageContainer} from "./relation/relation-storage-container";
import {QueryStarter} from "..";
import {Collector} from "../collector/collector";


/**
 * @internal
 */
export class ModelStorage {

    private romsController: RomsController;

    private relationStorageContainer: RelationStorageContainer;

    private givenName: string;

    private primaryKey: string;

    private data: Map<number | string, {[key: string]: unknown }>;

    private model_constructor: any;

    constructor(romsController: RomsController, givenName: string, model_constructor: any, primaryKey?: string) {
        this.romsController= romsController;
        this.relationStorageContainer = new RelationStorageContainer();

        this.givenName = givenName;
        this.primaryKey = (primaryKey) ? primaryKey : 'id';
        this.data = new Map();
        this.model_constructor = model_constructor;

        this.setFunctions();
    }

    public add(objects: {[key: string]: unknown }[], collector: Collector): (number | string)[] {

        if (!objects.length) {
            return [];
        }

        let added_objects = [];
        let added_ids = [];
        for (const object of objects) {

            if (!object) {
                continue;
            }

            const id = this.getPrimaryKeyValue(object);

            // we don't overwrite data, if the id is already known we continue.
            if (this.data.has(id)) {
                continue;
            }

            let new_object = { ...object }

            // check if the object has relations on it that we have to store separately + attach relations
            for (const key of Object.keys(object)) {
                if (!this.getRelationStorageContainer().hasKey(key)) {
                    continue;
                }

                // todo fix type
                const relation_value: any = (Array.isArray(new_object[key])) ? new_object[key] : [new_object[key]];

                // add the relation
                const relation_ids = this.getRelationStorageContainer().find(key).getRelationModelStorage().add(relation_value, collector);

                if (relation_ids.length) {
                    this.relationStorageContainer.find(key).attach([id], relation_ids, collector)
                }


                delete new_object[key];
            }

            this.data.set(id, new_object);
            added_objects.push(new_object);
            added_ids.push(id);
        }
        collector.add(this.getName(), added_objects);

        return added_ids;
    }

    public update(ids: (number | string)[], data: {[key: string]: unknown}, collector: Collector): void {
        let object = { ...data }

        for (const key of Object.keys(data)) {
            if (key === this.getPrimaryKey() || this.getRelationStorageContainer().hasKey(key)) {
                delete object[key];
            }
        }

        let updated_items = [];

        for (const id of ids) {
            if (!this.data.has(id)) {
                continue;
            }

            const old_object = this.data.get(id);
            let new_object = { ...old_object }
            new_object = Object.assign(new_object, object)
            this.data.set(id, new_object);

            updated_items.push(new_object);
        }

        collector.update(this.getName(), updated_items);
    }

    public remove(ids: (number | string)[], collector: Collector): void {
        let removed_ids = [];
        for (const id of ids) {
            if(this.data.delete(id)) {
                removed_ids.push(id);
            }
        }

        if (removed_ids.length) {
            collector.remove(this.getName(), removed_ids);
        }
    }

    has(id: number | string): boolean {
        return this.data.has(id);
    }

    public find(ids: (number | string)[]): { [key: string]: unknown }[] {
        let objects = [];

        for (const id of ids) {
            if (this.has(id)) {
                objects.push(Object.assign({}, this.data.get(id)));
            }
        }

        return objects;
    }

    public get(): { [key: string]: unknown }[] {
        return Array.from(this.data.values());
    }

    public getName(): string {
        return this.givenName;
    }

    public getPrimaryKey(): string {
        return this.primaryKey;
    }

    public getRelationStorageContainer(): RelationStorageContainer {
        return this.relationStorageContainer;
    }

    public createQuery(): QueryStarter {
        return new QueryStarter(this, this.romsController);
    }

    // todo we might want to make the models differently
    public createModel(object: {[key: string]: unknown}): any {

        let relations = [];
        let properties: {[key: string]: unknown} = {}

        let keys = Object.keys(object);

        keyLoop: for (const key of keys) {

            for (const relationKey of this.getRelationStorageContainer().getKeys()) {
                if (key === relationKey) {
                    relations.push({key: key, value: object[key]});
                    continue keyLoop;
                }
            }
            properties[key] = object[key];
        }

        let new_model  = new this.model_constructor(properties);

        for (const relation of relations) {
            Object.defineProperty(new_model, relation.key, {
                value: relation.value,
                enumerable: true,
                writable: true
            })
        }

        for (const relationKey of this.getRelationStorageContainer().getKeys()) {
            if (!object.hasOwnProperty(relationKey)) {
                // todo
            }
        }

        return new_model;
    }

    public updateAndCreateNewModel(old_model: any, new_values: any): any {
        let copied_model = this.createModel(old_model);
        let keys = Object.keys(new_values);

        for (const key of keys) {
            copied_model[key] = new_values[key];
        }

        return copied_model;
    }

    private setFunctions(): void {

        const self = this;

        // update
        this.model_constructor.prototype['update'] = function (data: any): void { // todo type?
            const id = self.getPrimaryKeyValue(this);

            if (!self.has(id)) {
                // todo error object doesn't exist
                return;
            }

            self.romsController.update(self.getName(), [id], data);
        };

        // remove
        this.model_constructor.prototype['remove'] = function (): void {
            const id = self.getPrimaryKeyValue(this);

            if (!self.has(id)) {
                // todo error object doesn't exist
                return;
            }

            self.romsController.remove(self.getName(), [id]);
        };

        // attach
        this.model_constructor.prototype['attach'] = function (relation: string, ids?: number | string | number[] | string[]): void {
            const id = self.getPrimaryKeyValue(this);

            if (!self.has(id)) {
                // todo error object doesn't exist
                return;
            }

            const ids_array: any = (!Array.isArray(ids)) ? [ids] : ids;

            self.romsController.attach(
                self.getName(),
                relation,
                [id],
                ids_array
            )
        };

        this.model_constructor.prototype['detach'] = function (relation: string, ids?: number | string | number[] | string[]): void {
            const id = self.getPrimaryKeyValue(this);

            if (!self.has(id)) {
                // todo error object doesn't exist
                return;
            }

            const ids_array: any = (!Array.isArray(ids)) ? [ids] : ids;

            self.romsController.detach(
                self.getName(),
                relation,
                [id],
                ids_array
            )
        };

        this.model_constructor.prototype['addRelation'] = function (relation: string, object: any | any[]): void {
            const id = self.getPrimaryKeyValue(this);

            if (!self.has(id)) {
                // todo error object doesn't exist
                return;
            }

            if (!self.getRelationStorageContainer().hasKey(relation)) {
                // todo error;
                return;
            }

            const relation_model_name = self
                .getRelationStorageContainer()
                .find(relation)
                .getRelationModelStorage()
                .getName();
            const relation_pk = self
                .getRelationStorageContainer()
                .find(relation)
                .getRelationModelStorage()
                .getPrimaryKey();

            const objects_array: any = (!Array.isArray(object)) ? [object] : object;

            self.romsController.holdInternally();

            self.romsController.add(relation_model_name, objects_array);

            let relation_ids = [];

            for (const relation_object of objects_array) {

                if (!relation_object.hasOwnProperty(relation_pk)) {
                    // todo maybe error?
                    continue;
                }
                relation_ids.push(relation_object[relation_pk]);
            }

            self.romsController.attach(
                self.getName(),
                relation,
                [id],
                relation_ids
            )

            self.romsController.continueInternally();
        };
    }

    public createRelationGetters(): void {
        for (const relation of this.relationStorageContainer.get()) {
            Object.defineProperties(this.model_constructor.prototype, {
                [relation.getKey()]: {
                    configurable: true,
                    get: function () {
                        console.log('fout');
                        return relation.findByObject(this);
                    },
                    set: function () {
                        throw 'Relation properties can\'t be overwritten'
                    }
                }
            })
        }
    }

    private getPrimaryKeyValue(object: {[key: string]: unknown }): string | number {

        if (!object[this.getPrimaryKey()]) {
            throw new Error(`Primary key "${this.getPrimaryKey()}" not found on given object.`);
        }

        if (typeof object[this.getPrimaryKey()] === "string") {
            return object[this.getPrimaryKey()] as string;
        }

        if (typeof object[this.getPrimaryKey()] === "number") {
            return object[this.getPrimaryKey()] as number;
        }

        throw new Error(`Primary key "${this.getPrimaryKey()}" is neither a number or string on give object.`);
    }
}
