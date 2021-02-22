import {RomsController} from "../roms/roms-controller";
import {ModelStorage} from "./model-storage";
import {ModelConfig} from "./configs/model-config";

/**
 * @internal
 */
export class ModelStorageContainer {

    private modelStorages: ModelStorage[];

    constructor() {
        this.modelStorages = [];
    }

    public create(config: ModelConfig, romsController: RomsController) {
        this.modelStorages.push(new ModelStorage(
            romsController,
            config.name.toLowerCase(),
            config.model,
            config.primaryKey
        ));
    }

    public has(name: string): boolean {
        for (const modelStorage of this.modelStorages) {
            if (modelStorage.getName() === name) {
                return true;
            }
        }
        return false;
    }

    public find(name: string): ModelStorage {
        for (const modelStorage of this.modelStorages) {
            if (modelStorage.getName() === name) {
                return modelStorage;
            }
        }

        throw new Error(`Model storage: "${name}" not found.`);
    }

    public get(): ModelStorage[] {
        return this.modelStorages;
    }
}
