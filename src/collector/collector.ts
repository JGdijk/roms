import {CollectorController} from "./collector-controller";
import {QueryData} from "../query/data/query-data";
import {CollectorPushResult} from "./push/collector-push-result";
import {PushController} from "./push/push-controller";

export class Collector {

    private collectorController: CollectorController;

    public constructor() {
        this.collectorController = new CollectorController();
    }

    public add(target: string, objects: any[]): void {
        this.collectorController.add(target, objects);
    }

    public update(target: string, objects: any[]): void {
        this.collectorController.update(target, objects);
    }

    public remove(target: string, ids: (number| string)[]): void {
        this.collectorController.remove(target, ids);
    }

    public attach(object_name: string, relation_name: string, object_id: string | number, relation_ids: (number| string)[]): void {
        this.collectorController.attach(object_name, relation_name, object_id, relation_ids);
    }

    public detach(object_name: string, relation_name: string, object_id: string | number, relation_ids: (number| string)[]): void {
        this.collectorController.detach(object_name, relation_name, object_id, relation_ids);
    }

    public check(queryData: QueryData): CollectorPushResult {
        const pushController = new PushController(this.collectorController, queryData);
        return pushController.check();
    }
}
