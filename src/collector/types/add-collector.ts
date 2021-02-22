import {CollectorTypeInterface} from "../collector-type-interface";

export class AddCollector implements CollectorTypeInterface {

    private data: any;

    constructor() {
        this.data = {};
    }

    public find(key: string): any[] {
        // todo error here?
        if (!this.has(key)) { return []; }

        return this.data[key].slice();
    }

    public has(key: string): boolean {
        return this.data.hasOwnProperty(key);
    }

    public add(target: string, objects: any[]): void {
        if (!this.data.hasOwnProperty(target)) {
            this.data[target] = [];
        }

        //todo we do have to check if there are no duplicates?!
        for (const object of objects) {
            this.data[target].push(object);
        }
    }

    public keys(): string[] {
        let keys = [];

        for (const i in this.data) {
            if (!this.data.hasOwnProperty(i)) { continue; }
            keys.push(i);
        }

        return keys;
    }
}
