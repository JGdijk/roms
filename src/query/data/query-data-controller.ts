import {QueryData} from "./query-data";
import {RomsController} from "../../roms/roms-controller";
import {Observable} from "rxjs";
import {filter, map, startWith} from "rxjs/operators";
import {Collector} from "../../collector/collector";
import {ModelStorage} from "../../store/model-storage";

export class QueryDataController {

    private romsController: RomsController

    private queryData: QueryData;

    private returnType: 'find' | 'find_many' | 'first' | 'get' | 'get_ids' | 'count' | null

    constructor(modelStorage: ModelStorage, romsController: RomsController) {
        this.romsController = romsController;
        this.queryData = new QueryData(modelStorage);
        this.returnType = null;
    }

    /*************************** observable ***************************
     ******************************************************************/

    public find(id: number | string): Observable<unknown> {
        // todo check if id
        this.returnType = 'find';
        this.queryData.setTargetIds([id]);
        return this.result();
    }

    public first(): Observable<unknown> {
        this.returnType = 'first';
        return this.result();
    }

    public get(): Observable<unknown[]> {
        this.returnType = 'get';
        return this.results();
    }

    public getIds(): Observable<unknown[]> {
        this.returnType = 'get_ids';
        return this.results();
    }

    public count(): Observable<number> {
        this.returnType = 'count';
        return this.results().length;
    }

    /*************************** static ***************************
     ******************************************************************/

    public findStatic(id: number | string): any {
        this.returnType = 'find';
        this.queryData.setTargetIds([id]);
        return this.returnData();
    }

    public firstStatic(): unknown {
        this.returnType = 'first';
        return this.returnData();
    }

    public getStatic(): unknown[] {
        this.returnType = 'get';
        return this.returnDataMany();
    }

    public getIdsStatic(): unknown[] {
        this.returnType = 'get_ids';
        return this.returnDataMany();
    }

    public countStatic(): number {
        this.returnType = 'count';
        return this.results().length;
    }

    /*************************** helpers ***************************
     ******************************************************************/

    private result(): Observable<any> {
        return this.romsController.getBroadcaster()
            .pipe(
                startWith(null),
                filter((collector: Collector) => {
                    return (!collector)
                        ? true
                        : this.push(collector);
                }),
                map(() => this.returnData())

            );
    }

    private results(): Observable<any> | any {
        return this.romsController.getBroadcaster()
            .pipe(
                startWith(null),
                filter((collector: Collector) => {
                    return (!collector)
                        ? true
                        : this.push(collector);
                }),
                map(() => this.returnDataMany())
            );
    }

    private returnData(): unknown {
        switch (this.returnType) {
            case 'find':
            case 'first':
                return this.queryData.get();
            default:
                throw new Error(`Query data controller: return data "${this.returnType}" not suitable for return type`);
        }
    }

    private returnDataMany(): unknown[] {
        switch (this.returnType) {
            case 'find_many':
            case 'get':
            case 'count':
                return this.queryData.get();
            case 'get_ids':
                return this.queryData.getIds();
            default:
                throw new Error(`Query data controller: return data many "${this.returnType}" not suitable for return type`);
        }
    }

    private push(collector: Collector): boolean {
        const collectorCheckResult = collector.check(this.queryData);


        if (collectorCheckResult.shouldPush()) {
            this.getQueryData().set(collectorCheckResult.getData());
            return true;
        }
        return false;
    }

    public getQueryData(): QueryData {
        return this.queryData;
    }
}
