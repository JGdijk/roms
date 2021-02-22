export class Model {

    constructor(data ?: unknown) {
        if (data) {
            Object.assign(this, data);
        }
    }

    public update(data: unknown): void {}

    public remove(): void {}

    public attach(relation: string, ids?: number | string | number[] | string[]): void {}

    public detach(relation: string, ids?: number | string | number[] | string[]): void {}

    public addRelation(relation: string, object: any | any[]): void {}
}
