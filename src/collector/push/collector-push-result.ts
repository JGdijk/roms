export class CollectorPushResult {

    private should_push: boolean;
    private data: any[];

    constructor(should_push: boolean, data: any[]) {
        this.should_push = should_push;
        this.data = data;
    }

    public shouldPush(): boolean {
        return this.should_push;
    }

    public getData(): any[] {
        return this.data;
    }


}