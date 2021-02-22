import {HasManyRelation, Model, ModelConfig} from "../../../src";

export class ProjectTest extends Model {
    name?: string

    public testFunction (): string {
        return 'test';
    }
}

export const ProjectTestModelConfig: ModelConfig = {
    name: 'projectTest',
    model: ProjectTest,
    relations: [
        {key: 'tasks', relation: new HasManyRelation('taskTest')},
    ]
}
