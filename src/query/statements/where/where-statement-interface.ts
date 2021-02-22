export interface WhereStatementInterface {
    has(key: string): boolean;
    hasWhereHas(key?: string): boolean;
    hasWhereHasComplicated(key: string): boolean;
    hasWhereDoesntHave(key?: string): boolean;
    hasWhereDoesntHaveComplicated(key: string): boolean;
    filter(objects: any[]): any[];
    check(object: any): boolean;
}