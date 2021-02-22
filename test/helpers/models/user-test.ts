import {HasOneRelation, Model, ModelConfig} from "../../../src";

export class UserTest extends Model {

}

export const UserTestModelConfig: ModelConfig = {
    name: 'userTest',
    model: UserTest,
    relations: [
        {key: 'address', relation: new HasOneRelation('addressTest', 'project_id', 'id')},
    ]
}
