import {Relation} from "./types/relation";
import {ModelStorage} from "../model-storage";
import {Collector} from "../../collector/collector";

/**
 * @internal
 */
export class RelationStorage {

    private modelStorage: ModelStorage;
    private relationModelStorage: ModelStorage;

    private relation: Relation;

    private relationKey: string;

    private data: Map<number | string, (number | string)[]>; // todo fix type for many / single

    constructor(relationKey: string, relation: Relation, modelStorage: ModelStorage, relationModelStorage: ModelStorage) {
        this.modelStorage = modelStorage;
        this.relationModelStorage = relationModelStorage;

        this.relation = relation;
        this.relationKey = relationKey;
        this.data = new Map();
    }

    public getKey(): string {
        return this.relationKey;
    }

    public has(id: number | string): boolean {
        return this.data.has(id);
    }

    // todo is this type oke?
    // public findByObject(object: {[key: string]: number | string}, createModels: boolean = false): unknown | unknown [] {
    public findByObject(object: { [key: string]: any }, createModels: boolean = false): any {
        return this.find(
            object[this.modelStorage.getPrimaryKey()],
            createModels
        )
    }

    // todo we should make a base class and extend on it for both many and single storage
    public find(id: number | string, createModels: boolean = false): unknown | unknown[] {

        // const ids = (this.relation.returnsMany())
        //     ? this.data.get(id)
        //     : [this.data.get(id)];

        let ids: any = this.data.get(id);

        if (ids === undefined) {
            return (this.relation.returnsMany())
                ? []
                : null;
        }

        // if ((!this.relation.returnsMany() && !ids) || (this.relation.returnsMany() && !ids.length)) {
        //     return (this.relation.returnsMany())
        //         ? []
        //         : null;
        // }

        // if (!Array.isArray(ids)) {
        //     ids = [ids];
        // }

        const objects = this.relationModelStorage.find(ids);

        if (!createModels) {
            return (this.relation.returnsMany())
                ? (objects.length) ? objects : []
                : (objects.length) ? objects[0] : null;
        }

        let models = [];

        for (const object of objects) {
            models.push(this.relationModelStorage.createModel(object));
        }

        return (this.relation.returnsMany())
            ? (models.length) ? models : []
            : (models.length) ? models[0] : null;
    }

    public attach(object_ids: (number | string)[], relation_ids: (number | string)[], collector: Collector, inherit: boolean = false): void {

        for (const object_id of object_ids) {

            // if (!this.modelStorage.has(object_id)) { todo this doesn't work because the main model is added after it's relations
            //     continue;
            // }

            let corrected_relation_ids = null;
            const existing_relation_ids = this.data.get(object_id);

            if (!this.relation.returnsMany()) {

                // check if it's a single unset relation
                if (existing_relation_ids === undefined) {
                    this.data.set(object_id, [relation_ids[0]])
                    corrected_relation_ids = [relation_ids[0]];
                } else {
                    // check if the existing relation is the same as the new one
                    if (existing_relation_ids[0] === relation_ids[0]) {
                        continue;
                    }
                    this.data.set(object_id, [relation_ids[0]])
                    corrected_relation_ids = relation_ids;
                }

            } else {

                if (existing_relation_ids === undefined) {
                    this.data.set(object_id, relation_ids);
                    corrected_relation_ids = relation_ids;
                } else {

                    corrected_relation_ids = [];
                    let new_relation_ids = [ ...existing_relation_ids ];

                    // we have to check for duplicates
                    for (const id of relation_ids) {
                        if (!existing_relation_ids.includes(id)) {
                            corrected_relation_ids.push(id);
                            new_relation_ids.push(id);
                        }
                    }
                    if (!corrected_relation_ids.length) {
                        continue;
                    }

                    this.data.set(object_id, new_relation_ids);
                }
            }

            collector.attach(this.getModelStorage().getName(), this.getRelationModelStorage().getName(), object_id, corrected_relation_ids);

            // todo check if actually something was updated

            if (!inherit) {
                if (!this.relationModelStorage.getRelationStorageContainer().hasRelationModelStorageName(this.getModelStorage().getName())) {
                    continue;
                }

                this.relationModelStorage.getRelationStorageContainer().findByRelationModelStorageName(this.getModelStorage().getName()).attach(
                    relation_ids,
                    object_ids,
                    collector,
                    true
                )
            }
        }
    }

    // todo filter what really was detached
    public detach(object_ids: (string| number)[], relation_ids: any[], collector: Collector, inherit: boolean = false): void {

        for (const object_id of object_ids) {

            if (!this.modelStorage.has(object_id)) {
                continue;
            }

            let corrected_relation_ids = null;
            const existing_relation_ids = this.data.get(object_id);

            if (!this.relation.returnsMany()) {

                // check if it's a single unset relation
                if (existing_relation_ids === undefined) {
                   continue;
                } else {
                    // check if the existing relation is the same as the new one
                    if (existing_relation_ids[0] !== relation_ids[0]) {
                        continue;
                    }
                    this.data.delete(object_id)
                    corrected_relation_ids = relation_ids;
                }

            } else {

                if (existing_relation_ids === undefined) {
                    continue;
                } else {

                    corrected_relation_ids = [];
                    const new_relation_ids = existing_relation_ids.filter((existing_relation_id) => {
                        if (relation_ids.includes(existing_relation_id)) {
                            corrected_relation_ids.push(existing_relation_id);
                            return false;
                        }
                        return true;
                    })

                    if (!corrected_relation_ids.length) {
                        continue;
                    }

                    if (!new_relation_ids.length) {
                        this.data.delete(object_id);
                    } else {
                        this.data.set(object_id, new_relation_ids);
                    }
                }
            }

            collector.detach(this.getModelStorage().getName(), this.getRelationModelStorage().getName(), object_id, corrected_relation_ids);

            // todo check if actually something was updated

            if (!inherit) {
                if (!this.relationModelStorage.getRelationStorageContainer().hasRelationModelStorageName(this.getModelStorage().getName())) {
                    continue;
                }

                this.relationModelStorage.getRelationStorageContainer().findByRelationModelStorageName(this.getModelStorage().getName()).detach(
                    relation_ids,
                    object_ids,
                    collector,
                    true
                )
            }
        }
    }

    public getRelationModelStorage(): ModelStorage {
        return this.relationModelStorage;
    }

    public getModelStorage(): ModelStorage {
        return this.modelStorage;
    }

    public getRelation(): Relation {
        return this.relation;
    }
}
