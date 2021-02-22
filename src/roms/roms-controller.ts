
import {ModelConfig} from "..";
import {Collector} from "../collector/collector";
import {Observable} from "rxjs";
import {publish} from "rxjs/operators";
import {ModelStorageContainer} from "../store/model-storage-container";


/**
 * @internal
 */
export class RomsController {

    /**
     * The storage container holds all the models and their relation data
     *
     * @private
     */
    private modelStorageContainer: ModelStorageContainer

    private observer: any; //todo type

    private broadcaster: any; //todo type

    private collector: Collector | null;

    private hold_externally: boolean;

    private hold_internally: boolean;

    constructor() {
        this.modelStorageContainer = new ModelStorageContainer();
        this.initBroadcasting();

        this.collector = null;
        this.hold_externally = false;
        this.hold_internally = false;
    }

    /**
     *
     * @param configs
     */
    public addModelConfigs(configs: ModelConfig[]): void {

        // creates all the modelStorage classes inside of the container
        for (const config of configs) {
            if (this.getModelStorageContainer().has(config.name.toLowerCase())) {
                continue;
            }

            this.getModelStorageContainer().create(config, this);
        }


        // creates all the relations
        for (const config of configs) {

            if (!config.relations || !config.relations.length) {
                continue;
            }

            const modelStorage = this.getModelStorageContainer().find(config.name.toLowerCase());

            for (const relationConfig of config.relations) {

                if (!this.getModelStorageContainer().has(relationConfig.relation.getName())){
                    continue;
                }

                const relationStorage = this.getModelStorageContainer().find(relationConfig.relation.getName());

                modelStorage.getRelationStorageContainer().add(relationConfig, modelStorage, relationStorage);
            }
        }

        // create all the relation getters.
        for (const modelStorage of this.getModelStorageContainer().get()) {
            modelStorage.createRelationGetters();
        }

    }

    public add(key: string, objects: { [key: string]: unknown }[]): void {
        const collector = this.getCollector();
        this.getModelStorageContainer().find(key).add(objects, collector);
        this.pushChecker(collector);
    }

    public update(key: string, ids: (number | string)[], data: {[key: string]: unknown}): void {
        const collector = this.getCollector();
        this.getModelStorageContainer().find(key).update(ids, data, collector);
        this.pushChecker(collector);
    }

    public remove(key: string, ids: (number | string)[]): void {
        const collector = this.getCollector();
        this.getModelStorageContainer().find(key).remove(ids, collector);
        this.pushChecker(collector);
    }

    public attach(key: string, relation: string, key_ids: (string | number)[], relation_ids: (string | number)[]): void {
        const collector = this.getCollector();
        //todo check if relation exists error?
        if (!this.getModelStorageContainer().find(key).getRelationStorageContainer().hasKey(relation)) {
            return;
        }

        this.getModelStorageContainer()
            .find(key)
            .getRelationStorageContainer()
            .find(relation)
            .attach(key_ids, relation_ids, collector);

        this.pushChecker(collector);
    }

    public detach(key: string, relation: string, key_ids: (string | number)[], relation_ids: (string | number)[]): void {
        const collector = this.getCollector();
        //todo check if relation exists error?
        if (!this.getModelStorageContainer().find(key).getRelationStorageContainer().hasKey(relation)) {
            return;
        }

        this.getModelStorageContainer()
            .find(key)
            .getRelationStorageContainer()
            .find(relation)
            .detach(key_ids, relation_ids, collector);

        this.pushChecker(collector);
    }

    public getModelStorageContainer(): ModelStorageContainer {
        return this.modelStorageContainer;
    }

    public holdInternally(): void {
        this.hold_internally = true;
    }

    public holdExternally(): void {
        this.hold_externally = true;
    }

    public continueInternally(): void {
        if (!this.hold_internally) {
            return;
        }

        this.hold_internally = false;

        if (this.hold_externally || !this.collector) {
            return;
        }

        this.pushChecker(this.collector);
    }

    public continueExternally(): void {
        if (!this.hold_externally) {
            return;
        }

        this.hold_externally = false;

        if (!this.collector) {
            return;
        }

        this.pushChecker(this.collector);
    }


    private pushChecker(collector: Collector) {
        if (this.pushIsOnHold()) {
            return;
        }

        this.observer.next(collector);

        if (this.collector) {
            this.collector = null;
        }
    }

    private getCollector(): Collector {
        if (this.collector) {
            return this.collector;
        }

        const collector = new Collector();

        if (this.pushIsOnHold() && !this.collector) {
            this.collector = collector;
        }

        return collector;
    }

    public getBroadcaster() {
        return this.broadcaster;
    }

    private pushIsOnHold(): boolean {
        return this.hold_internally || this.hold_externally;
    }

    private initBroadcasting(): void {
        this.broadcaster = new Observable(observer => {
            this.observer = observer;
        }).pipe(publish());
        this.broadcaster.connect();
    }
}
