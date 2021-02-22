
import {RomsController} from "../roms/roms-controller";
import {QueryBuilder} from "./query-builder";
import {Observable} from "rxjs";
import {ModelStorage} from "../store/model-storage";

export class QueryStarter {

    private modelStorage: ModelStorage;

    private romsController: RomsController;

    constructor(modelStorage: ModelStorage, romsController: RomsController) {
        this.modelStorage = modelStorage;
        this.romsController = romsController;
    }


    /*************************** retrieving ***************************
     ******************************************************************/

    public find(id: number | string): Observable<unknown> {
        return this.createQuery().find(id);
    }

    public first(): Observable<any> {
        return this.createQuery().first();
    }

    public get(): Observable<any[]> {
        return this.createQuery().get();
    }

    public getIds(): Observable<any> {
        return this.createQuery().getIds();
    }

    public count(): Observable<any> {
        return this.createQuery().count();
    }

    // static
    public findStatic(id: number | string): any {
        return this.createQuery().findStatic(id);
    }

    public firstStatic(): any {
        return this.createQuery().firstStatic()
    }

    public getStatic(): any {
        return this.createQuery().getStatic()
    }

    public getIdsStatic(): any {
        return this.createQuery().getIdsStatic();
    }

    public countStatic(): any {
        return this.createQuery().countStatic()
    }

    /*************************** where statements ***************************
     ******************************************************************/

    public where(key: string | any, action?: string, value?: string|number): QueryBuilder {
        return this.createQuery().where(key, action, value);
    }

    public orWhere(key: string | any, action?: string, value?: string|number): QueryBuilder {
        return this.createQuery().orWhere(key, action, value);
    }

    public whereBetween(key: string, low: number, high: number): QueryBuilder {
        return this.createQuery().whereBetween(key, low, high);
    }

    public whereNotBetween(key: string, low: number, high: number): QueryBuilder {
        return this.createQuery().whereNotBetween(key, low, high);
    }

    public whereIn(key: string, values: number[] | string[]): QueryBuilder {
        return this.createQuery().whereIn(key, values);
    }

    public whereNotIn(key: string, values: number[] | string[]): QueryBuilder {
        return this.createQuery().whereNotIn(key, values);
    }

    public whereExists(key: string): QueryBuilder {
        return this.createQuery().whereExists(key);
    }

    public whereNotExists(key: string): QueryBuilder {
        return this.createQuery().whereNotExists(key);
    }

    public whereEmpty(key: string): QueryBuilder {
        return this.createQuery().whereEmpty(key);
    }

    public whereNotEmpty(key: string): QueryBuilder {
        return this.createQuery().whereNotEmpty(key);
    }

    public whereHas(key: string, callback?: any): QueryBuilder {
        return this.createQuery().whereHas(key, callback);
    }

    public whereDoesntHave(key: string, callback?: any): QueryBuilder {
        return this.createQuery().whereDoesntHave(key, callback);
    }

    /*************************** ordery by ***************************
     ******************************************************************/

    public orderBy(key: string, order?: 'asc' | 'desc'): QueryBuilder {
        return this.createQuery().orderBy(key, order);
    }

    /*************************** join ***************************
     ******************************************************************/

    public with(name: string | string[], callback?: any): QueryBuilder { //fix type
        return this.createQuery().with(name, callback);
    }

    /*************************** direct actions ***************************
     ******************************************************************/

    public add(objects: {[key: string]: unknown } | {[key: string]: unknown }[]): void {

        const array = (Array.isArray(objects))
            ? objects
            : [objects];

        this.romsController.add(this.modelStorage.getName(), array);
    }

    public update(data: any, ids ?: number | string | number[] | string[]): void {
        this.createQuery().update(data, ids);
    }

    public remove(ids?: number | string | number[] | string): void {
        this.createQuery().remove(ids);
    }

    public attach(ids: number | string | number[] | string[],
                  relation_name: string,
                  relation_ids: number | string | number[] | string[]
    ): void {
        this.createQuery().attach(ids, relation_name, relation_ids);
    }

    public detach(ids: number | string | number[] | string[],
                  relation_name: string,
                  relation_ids: number | string | number[] | string[]): void {
        this.createQuery().detach(ids, relation_name, relation_ids);
    }

    /*************************** helpers ***************************
     ******************************************************************/

    private createQuery(): QueryBuilder {
        return new QueryBuilder(this.modelStorage, this.romsController);
    }
}
