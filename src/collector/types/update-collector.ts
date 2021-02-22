import {CollectorTypeInterface} from "../collector-type-interface";

export class UpdateCollector implements CollectorTypeInterface {

    private data: any;

    constructor() {
        this.data = {};
    }

    public add(target: string, objects: any[]): void {
        if (!this.data.hasOwnProperty(target)) {
            this.data[target] = [];
        }

        for (const object of objects) {
            this.data[target].push(object);
        }
    }

    public find(key: string): any {
        // todo error here?
        // todo this is not immutable, multiple pushControllers get the same object. fix in pushcontrollers.
        if (!this.has(key)) { return []; }

        return this.data[key].slice();
    }

    public keys() {
        let keys = [];

        for (const i in this.data) {
            if (!this.data.hasOwnProperty(i)) { continue; }
            keys.push(i);
        }

        return keys;
    }

    public has(key: string): boolean {
        return this.data.hasOwnProperty(key);
    }
}