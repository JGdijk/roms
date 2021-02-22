import {WhereStatementControllerBag} from "./where-statement-controller-bag";
import {ModelStorage} from "../../../store/model-storage";

export class WhereStatementController {

    private bags: WhereStatementControllerBag[];

    private modelStorage: ModelStorage;

    private has_check: boolean;
    private has_where_has_check: boolean;
    private has_where_doesnt_have_check: boolean;

    private has_check_key_object: any; // todo types
    private has_where_has_check_key_object: any; // todo types
    private has_where_has_complicated_check_key_object: any; // todo types
    private has_where_doesnt_have_check_key_object: any; // todo types
    private has_where_doesnt_have_complicated_check_key_object: any; // todo types

    constructor(modelStorage: ModelStorage) {

        this.modelStorage = modelStorage;

        this.bags = [];
        this.addBag();

        this.has_check = false;
        this.has_where_has_check = false;
        this.has_where_doesnt_have_check = false;

        this.has_check_key_object = {};
        this.has_where_has_check_key_object = {};
        this.has_where_has_complicated_check_key_object = {};
        this.has_where_doesnt_have_check_key_object = {};
        this.has_where_doesnt_have_complicated_check_key_object = {};
    }

    public add(statement: any): void {
        this.bags[0].add(statement);
    }

    public addNewBag(statement: any): void {
        const bag = this.addBag();
        bag.add(statement);
    }

    public has(key?: string): boolean {
        if (!key && this.has_check) {
            return this.has_check;
        }
        if (key && this.has_check_key_object.hasOwnProperty(key)) {
            return this.has_check_key_object[key];
        }

        for (const bag of this.bags) {
            // todo this isn't right
            if (bag.has(key)) {
                if (!key) {
                    this.has_check = true;
                } else {
                    this.has_check_key_object[key] = true;
                }
                return true;
            }
        }

        if (!key) {
            for (const bag of this.bags) {
                if (bag.has()) {
                    this.has_check = true;
                    return true;
                }
            }
            this.has_check = false;
        } else {
            this.has_check_key_object[key] = false;
        }
        return false;
    }

    public hasWhereHas(key?: string): boolean {
        for (const bag of this.bags) {
            if (bag.hasWhereHas(key)) {
                return true;
            }
        }
        return false;
    }

    public hasWhereHasComplicated(key?: string): boolean {
        for (const bag of this.bags) {
            if (bag.hasWhereHasComplicated(key)) {
                return true;
            }
        }
        return false;
    }

    public hasWhereDoesntHave(key?: string): boolean {
        for (const bag of this.bags) {
            if (bag.hasWhereDoesntHave(key)) {
                return true;
            }
        }
        return false;
    }

    public hasWhereDoesntHaveComplicated(key?: string): boolean {
        for (const bag of this.bags) {
            if (bag.hasWhereDoesntHaveComplicated(key)) {
                return true;
            }
        }
        return false;
    }

    public filter(objects: any[]): any[] {

        let allowed_objects = [];
        for (const bag of this.bags) {
            const bag_objects = bag.filter(objects.slice());
            objectLoop: for (const object of bag_objects) {
                for (const allowed_object of allowed_objects) {
                    if (allowed_object[this.modelStorage.getPrimaryKey()] === object[this.modelStorage.getPrimaryKey()]) {
                        continue objectLoop;
                    }
                }
                allowed_objects.push(object);
            }
        }

        return allowed_objects;
    }

    public check(object: any): boolean {
        for (const bag of this.bags) {
            if (bag.check(object)) {
                return true;
            }
        }
        return false;
    }

    private addBag(): WhereStatementControllerBag {
        const bag = new WhereStatementControllerBag();
        this.bags.push(bag);
        return bag;
    }

}
