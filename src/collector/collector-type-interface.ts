export interface CollectorTypeInterface {

    //todo this has to be different
    find(key: string, key2?: any, key3?: any): any;
    has(key: string): boolean;
    keys(): string[];
}