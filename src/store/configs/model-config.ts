import {RelationConfig} from "./relation-config";

export type ModelConfig = {
    name: string,
    model: unknown,
    primaryKey?: string,
    relations?: RelationConfig[]
}
