import {RomsController} from "../roms/roms-controller";
import {Observable} from "rxjs";
import {QueryDataController} from "./data/query-data-controller";
import {WhereStatement} from "./statements/where/statements/where-statement";
import {WhereStatementCallbackStatement} from "./statements/where/statements/callback/where/where-statement-callback-statement";
import {WhereBetweenStatement} from "./statements/where/statements/where-between-statement";
import {WhereNotBetweenStatement} from "./statements/where/statements/where-not-between-statement";
import {WhereInStatement} from "./statements/where/statements/where-in-statement";
import {WhereNotInStatement} from "./statements/where/statements/where-not-in-statement";
import {WhereExistsStatement} from "./statements/where/statements/where-exists-statement";
import {WhereNotExistsStatement} from "./statements/where/statements/where-not-exists-statement";
import {WhereEmptyStatement} from "./statements/where/statements/where-empty-statement";
import {WhereNotEmptyStatement} from "./statements/where/statements/where-not-empty-statement";
import {WhereHasStatementCallbackStatement} from "./statements/where/statements/callback/where-has/where-has-statement-callback-statement";
import {WhereHasStatement} from "./statements/where/statements/where-has-statement";
import {WhereDoesntHaveStatementCallbackStatement} from "./statements/where/statements/callback/where-doesnt-have/where-doesnt-have-statement-callback-statement";
import {WhereDoesntHaveStatement} from "./statements/where/statements/where-doesnt-have-statement";
import {OrderByStatement} from "./statements/order/order-by-statement";
import {JoinCallbackStatement} from "./statements/join/statements/callback/join-callback-statement";
import {JoinStatement} from "./statements/join/statements/join-statement";
import {ModelStorage} from "../store/model-storage";
import {WhereStatementCallback} from "./statements/where/statements/callback/where/where-statement-callback";
import {JoinCallback} from "./statements/join/statements/callback/join-callback";

export class QueryBuilder {

    private modelStorage: ModelStorage;

    private romsController: RomsController;

    private queryDataController: QueryDataController;

    constructor(modelStorage: ModelStorage, romsController: RomsController) {
        this.modelStorage = modelStorage;
        this.romsController = romsController;
        this.queryDataController = new QueryDataController(modelStorage, romsController)
    }

    /*************************** retrieving ***************************
     ******************************************************************/

    public find(id: number | string): Observable<any> {
        return this.queryDataController.find(id);
    }

    public findMany(ids: (number | string)[]): Observable<any>[] {
        return this.queryDataController.findMany(ids);
    }

    public first(): Observable<any> {
        return this.queryDataController.first()
    }

    public get(): Observable<any[]> {
        return this.queryDataController.get()
    }

    public getIds(): Observable<any[]> {
        return this.queryDataController.getIds();
    }

    public count(): Observable<number> {
        return this.queryDataController.count()
    }

    // static

    public findStatic(id: number | string): any {
        return this.queryDataController.findStatic(id);
    }

    public findManyStatic(ids: (number | string)[]): Observable<any>[] {
        return this.queryDataController.findManyStatic(ids);
    }

    public firstStatic(): any {
        return this.queryDataController.firstStatic()
    }

    public getStatic(): any {
        return this.queryDataController.getStatic()
    }

    public getIdsStatic(): any {
        return this.queryDataController.getIdsStatic();
    }

    public countStatic(): any {
        return this.queryDataController.countStatic()
    }

    /*************************** where statements ***************************
     ******************************************************************/

    public where(key: string | any, action?: string, value?: string | number): QueryBuilder {
        if (action) {
            this.queryDataController.getQueryData().getWhereStatementController().add(new WhereStatement(key, action, value));
        } else {
            this.queryDataController.getQueryData().getWhereStatementController().add(new WhereStatementCallbackStatement(key, this.modelStorage));
        }
        return this;
    }


    public orWhere(key: string | any, action?: string, value?: string | number): QueryBuilder {
        if (action) {
            this.queryDataController.getQueryData().getWhereStatementController().addNewBag(new WhereStatement(key, action, value));
        } else {
            this.queryDataController.getQueryData().getWhereStatementController().addNewBag(new WhereStatementCallbackStatement(key, this.modelStorage));
        }
        return this;
    }

    public whereBetween(key: string, low: number, high: number): QueryBuilder {
        this.queryDataController.getQueryData().getWhereStatementController().add(new WhereBetweenStatement(key, low, high));
        return this;
    }

    public orWhereBetween(key: string, low: number, high: number): QueryBuilder {
        this.orWhere((callback: WhereStatementCallback) => {
            callback.whereBetween(key, low, high);
        })
        return this;
    }

    public whereNotBetween(key: string, low: number, high: number): QueryBuilder {
        this.queryDataController.getQueryData().getWhereStatementController().add(new WhereNotBetweenStatement(key, low, high));
        return this;
    }

    public orWhereNotBetween(key: string, low: number, high: number): QueryBuilder {
        this.orWhere((callback: WhereStatementCallback) => {
            callback.whereNotBetween(key, low, high);
        })
        return this;
    }

    public whereIn(key: string, values: number[] | string[]): QueryBuilder {
        this.queryDataController.getQueryData().getWhereStatementController().add(new WhereInStatement(key, values));
        return this;
    }

    public orWhereIn(key: string, values: number[] | string[]): QueryBuilder {
        this.orWhere((callback: WhereStatementCallback) => {
            callback.whereIn(key, values);
        })
        return this;
    }

    public whereNotIn(key: string, values: number[] | string[]): QueryBuilder {
        this.queryDataController.getQueryData().getWhereStatementController().add(new WhereNotInStatement(key, values));
        return this;
    }

    public orWhereNotIn(key: string, values: number[] | string[]): QueryBuilder {
        this.orWhere((callback: WhereStatementCallback) => {
            callback.whereNotIn(key, values);
        })
        return this;
    }

    public whereExists(key: string): QueryBuilder {
        this.queryDataController.getQueryData().getWhereStatementController().add(new WhereExistsStatement(key));
        return this;
    }

    public orWhereExists(key: string): QueryBuilder {
        this.orWhere((callback: WhereStatementCallback) => {
            callback.whereExists(key);
        })
        return this;
    }

    public whereNotExists(key: string): QueryBuilder {
        this.queryDataController.getQueryData().getWhereStatementController().add(new WhereNotExistsStatement(key));
        return this;
    }

    public orWhereNotExists(key: string): QueryBuilder {
        this.orWhere((callback: WhereStatementCallback) => {
            callback.whereNotExists(key);
        })
        return this;
    }

    public whereEmpty(key: string): QueryBuilder {
        this.queryDataController.getQueryData().getWhereStatementController().add(new WhereEmptyStatement(key));
        return this;
    }

    public orWhereEmpty(key: string): QueryBuilder {
        this.orWhere((callback: WhereStatementCallback) => {
            callback.whereEmpty(key);
        })
        return this;
    }

    public whereNotEmpty(key: string): QueryBuilder {
        this.queryDataController.getQueryData().getWhereStatementController().add(new WhereNotEmptyStatement(key));
        return this;
    }

    public orWhereNotEmpty(key: string): QueryBuilder {
        this.orWhere((callback: WhereStatementCallback) => {
            callback.whereNotEmpty(key);
        })
        return this;
    }

    // todo where on dates

    public whereHas(key: string, callback?: any): QueryBuilder {
        //todo checks if relation is not found
        const relation = this.modelStorage.getRelationStorageContainer().find(key);

        if (callback) {
            this.queryDataController.getQueryData().getWhereStatementController().add(new WhereHasStatementCallbackStatement(relation, callback))
        } else {
            this.queryDataController.getQueryData().getWhereStatementController().add(new WhereHasStatement(relation));
        }

        return this;
    }

    public orWhereHas(key: string, callback?: any): QueryBuilder {
        //todo checks if relation is not found
        this.orWhere((callback: WhereStatementCallback) => {
            callback.whereHas(key, callback);
        })
        return this;
    }

    public whereDoesntHave(key: string, callback?: any): QueryBuilder {
        const relation = this.modelStorage.getRelationStorageContainer().find(key);

        if (callback) {
            this.queryDataController.getQueryData().getWhereStatementController().add(new WhereDoesntHaveStatementCallbackStatement(relation, callback))
        } else {
            this.queryDataController.getQueryData().getWhereStatementController().add(new WhereDoesntHaveStatement(relation));
        }

        return this;
    }

    public orWhereDoesntHave(key: string, callback?: any): QueryBuilder {
        //todo checks if relation is not found
        this.orWhere((callback: WhereStatementCallback) => {
            callback.whereDoesntHave(key, callback);
        })
        return this;
    }


    /*************************** order by ***************************
     ******************************************************************/

    public orderBy(key: string, order?: 'asc' | 'desc'): QueryBuilder {
        this.queryDataController.getQueryData().getOrderByStatementController().add(new OrderByStatement(key, order));
        return this;
    }

    /*************************** join ***************************
     ******************************************************************/

    public with(name: string | string[], callback?: any): QueryBuilder { //todo fix type
        if (callback && !Array.isArray(name)) {

            const splitNames = name.split('.');

            if (splitNames.length > 1) {
                const relation = this.modelStorage.getRelationStorageContainer().find(splitNames[0]);
                const chained_relation_string = splitNames.slice(1).join('.')
                this.queryDataController.getQueryData().getJoinStatementController().add(new JoinCallbackStatement(relation, callback, chained_relation_string))
            } else {
                const relation = this.modelStorage.getRelationStorageContainer().find(name);
                this.queryDataController.getQueryData().getJoinStatementController().add(new JoinCallbackStatement(relation, callback))
            }

        } else {
            if (!Array.isArray(name)) {

                const splitNames = name.split('.');

                if (splitNames.length > 1) {
                    const relation = this.modelStorage.getRelationStorageContainer().find(splitNames[0]);
                    const chained_relation_string = splitNames.slice(1).join('.')
                    // todo fix the type of callback
                    this.queryDataController.getQueryData().getJoinStatementController().add(new JoinCallbackStatement(relation, (callback: JoinCallback) => {
                        callback.with(chained_relation_string);
                    }))
                } else {
                    const relation = this.modelStorage.getRelationStorageContainer().find(name);
                    this.queryDataController.getQueryData().getJoinStatementController().add(new JoinStatement(relation));
                }
            } else {
                for (const v of name) {

                    const splitNames = v.split('.');

                    if (splitNames.length > 1) {
                        const relation = this.modelStorage.getRelationStorageContainer().find(splitNames[0]);
                        const chained_relation_string = splitNames.slice(1).join('.')
                        // todo changes this because here we don't have to pass the callback, we just do it to fix type
                        this.queryDataController.getQueryData().getJoinStatementController().add(new JoinCallbackStatement(relation, (callback: JoinCallback) => {
                            callback.with(chained_relation_string);
                        }))
                    } else {
                        const relation = this.modelStorage.getRelationStorageContainer().find(v);
                        this.queryDataController.getQueryData().getJoinStatementController().add(new JoinStatement(relation));

                    }
                }
            }
        }
        return this;
    }

    /*************************** direct actions ***************************
     ******************************************************************/

    public update(data: any, ids_in?: number | string | number[] | string[]): void {

        let ids = null;
        if (ids_in) {
            if (!Array.isArray(ids_in)) {
                ids = [ids_in];
            } else {
                ids = ids_in;
            }
        }

        let objects: any[] = this.modelStorage.get();

        // todo why is this?
        objects = this.queryDataController.getQueryData().getWhereStatementController().filter(objects);

        let object_ids: number[] = [];

        for (const object of objects) {
            if (ids && ids.length) {
                if (!ids.includes(object[this.modelStorage.getPrimaryKey()])) {
                    continue;
                }
            }
            object_ids.push(object[this.modelStorage.getPrimaryKey()]);
        }

        this.romsController.update(this.modelStorage.getName(), object_ids, data);
    }

    public remove(ids_in?: number | string | number[] | string): void {

        let ids = null;

        if (ids_in) {
            if (!Array.isArray(ids_in)) {
                ids = [ids_in];
            } else {
                ids = ids_in;
            }
        }

        // todo if where statement controller doesn't have anything

        if (!this.queryDataController.getQueryData().getWhereStatementController().has()) {
            if (!ids) {
                // throw error
                return;
            }

            this.romsController.remove(this.modelStorage.getName(), ids);
            return;
        }

        let objects: any[] = this.modelStorage.get();

        objects = this.queryDataController.getQueryData().getWhereStatementController().filter(objects);
        let object_ids: number[] = [];

        for (const object of objects) {
            if (ids && ids.length) {
                if (!ids.includes(object[this.modelStorage.getPrimaryKey()])) {
                    continue;
                }
            }
            object_ids.push(object[this.modelStorage.getPrimaryKey()]);
        }

        this.romsController.remove(this.modelStorage.getName(), object_ids);
    }

    public attach(ids: number | string | number[] | string[],
                  relation_name: string,
                  relation_ids: number | string | number[] | string[]): void {

        const relation_ids_array: any = (Array.isArray(relation_ids))
            ? relation_ids
            : [relation_ids];

        const object_ids_array: any[] = (Array.isArray(ids)) ? ids : [ids];

        this.romsController.attach(this.modelStorage.getName(), relation_name, object_ids_array, relation_ids_array);
    }

    public detach(ids: number | string | number[] | string[],
                  relation_name: string,
                  relation_ids: number | string | number[] | string[]): void {

        let relation_ids_array = null;
        if (!relation_ids || relation_ids === '*') {
            relation_ids_array = ['*']
        } else {
            relation_ids_array = (Array.isArray(relation_ids))
                ? relation_ids
                : [relation_ids];
        }

        const object_ids_array: any[] = (Array.isArray(ids)) ? ids : [ids];

        this.romsController.detach(this.modelStorage.getName(), relation_name, object_ids_array, relation_ids_array);
    }

}
