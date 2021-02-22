import {RelationStorage} from "./relation-storage";
import {ModelStorage} from "../model-storage";
import {RelationConfig} from "../..";
import {RomsController} from "../../roms/roms-controller";

export class RelationStorageContainer {

    private relationStorages: RelationStorage[];

    constructor() {
        this.relationStorages = [];
    }

    public add(config: RelationConfig, modelStorage: ModelStorage, relationModelStorage: ModelStorage): void {
        this.relationStorages.push(new RelationStorage(
            config.key,
            config.relation,
            modelStorage,
            relationModelStorage
        ))
    }

    public find(key: string): RelationStorage {
        for (const relationStorage of this.relationStorages) {
            if (key === relationStorage.getKey()) {
                return relationStorage;
            }
        }
        throw new Error(`Relation storage "${key}" not found`);
    }

    public get(): RelationStorage[] {
        return this.relationStorages;
    }

    public findByRelationModelStorageName(name: string): RelationStorage {
        for (const relationStorage of this.relationStorages) {
            if (name === relationStorage.getRelationModelStorage().getName()) {
                return relationStorage;
            }
        }
        throw new Error(`Relation storage with relationModelStorage name "${name}" not found`);
    }

    public hasKey(key: string): boolean {
        for (const k of this.getKeys()) {
            if (key === k) {
                return true;
            }
        }
        return false;
    }

    public hasRelationModelStorageName(name: string): boolean {
        for (const relationStorage of this.relationStorages) {
            if (name === relationStorage.getRelationModelStorage().getName()) {
                return true;
            }
        }
        return false;
    }

    public getKeys(): string[] {
        let keys = [];
        for (const relation of this.relationStorages) {
            keys.push(relation.getKey());
        }
        return keys;
    }
}
