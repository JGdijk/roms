import {AddCollector} from "./types/add-collector";
import {UpdateCollector} from "./types/update-collector";
import {RemoveCollector} from "./types/remove-collector";
import {AttachCollector} from "./types/attach-collector";
import {DetachCollector} from "./types/detach-collector";

export class CollectorController {

    private addCollector: AddCollector;
    private updateCollector: UpdateCollector;
    private removeCollector: RemoveCollector;
    private attachCollector: AttachCollector;
    private detachCollector: DetachCollector;

    public constructor(addCollector?: AddCollector,
                       updateCollector?: UpdateCollector,
                       removeCollector?: RemoveCollector,
                       attachCollector?: AttachCollector,
                       detachCollector?: DetachCollector) {

        this.addCollector = (addCollector) ? addCollector : new AddCollector();
        this.updateCollector = (updateCollector) ? updateCollector : new UpdateCollector();
        this.removeCollector = (removeCollector) ? removeCollector : new RemoveCollector();
        this.attachCollector = (attachCollector) ? attachCollector : new AttachCollector();
        this.detachCollector = (detachCollector) ? detachCollector : new DetachCollector();
    }

    public add(target: string, objects: any[]): void {
        this.addCollector.add(target, objects);
    }
    public update(target: string, objects: any[]): void {
        this.updateCollector.add(target, objects);
    }
    public remove(target: string, ids: (number| string)[]): void {
        this.removeCollector.add(target, ids);
    }
    public attach(object_name: string, relation_name: string, object_id: string | number, relation_ids: (number| string)[]) {
        this.attachCollector.add(object_name, relation_name, object_id, relation_ids);
    }

    public detach(object_name: string, relation_name: string, object_id: string | number, relation_ids: (number| string)[]) {
        this.detachCollector.add(object_name, relation_name, object_id, relation_ids);
    }

    public getAddCollector(): AddCollector { return this.addCollector; }
    public getUpdateCollector(): UpdateCollector { return this.updateCollector; }
    public getRemoveCollector(): RemoveCollector { return this.removeCollector; }
    public getAttachCollector(): AttachCollector { return this.attachCollector; }
    public getDetachCollector(): DetachCollector { return this.detachCollector; }

}
