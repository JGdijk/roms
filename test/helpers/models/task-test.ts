import {BelongsToRelation, HasManyRelation, Model, ModelConfig} from "../../../src";

export class TaskTest extends Model {

}

export const TaskTestModelConfig: ModelConfig = {
    name: 'taskTest',
    model: TaskTest,
    primaryKey: 'task_id',
    relations: [
        {key: 'project', relation: new BelongsToRelation('projectTest', 'project_id', 'id')},
        {key: 'users', relation: new HasManyRelation('userTest', 'task_id', 'id')},
    ]
}
