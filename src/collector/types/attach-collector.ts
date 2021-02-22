import {CollectorTypeInterface} from "../collector-type-interface";

export class AttachCollector implements CollectorTypeInterface{

    private data: any;

    constructor() {
        this.data = {}
    }

    public find(object_name: string, object_id: string | number, relation_name: string): number[] | string[] {
        if (!this.has(object_name, relation_name, object_id)) { return []; }
        return this.data[object_name][relation_name][object_id].slice();
    }

    public keys() {
        let keys = [];

        for (const i in this.data) {
            if (!this.data.hasOwnProperty(i)) { continue; }
            keys.push(i);
        }

        return keys;
    }

    public has(object_name: string, relation_name?: string, object_id?: string | number): boolean {
        if (!this.data.hasOwnProperty(object_name)) { return false; }

        if (!relation_name) {
            return false;
        } else {
            if (!this.data[object_name].hasOwnProperty(relation_name)) { return false;}

            if (!object_id) { return false; }
            else {
                if (!this.data[object_name][relation_name].hasOwnProperty(object_id)) { return false;}
            }
        }

        return true;
    }

    public add(object_name: string, relation_name: string, object_id: string | number, relation_ids: (number| string)[]): void {
        if (!this.data.hasOwnProperty(object_name)) { this.data[object_name] = {}; }
        if (!this.data[object_name].hasOwnProperty(relation_name)) { this.data[object_name][relation_name] = {}; }
        if (!this.data[object_name][relation_name][object_id]) { this.data[object_name][relation_name][object_id] = []; }

        for (const id of relation_ids) {
            this.data[object_name][relation_name][object_id].push(id);
        }
    }

}
