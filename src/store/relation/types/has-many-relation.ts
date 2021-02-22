import {Relation} from "./relation";

export class HasManyRelation extends Relation {

    constructor(model: string, foreignKey?: string, localKey?: string) {
        super(model);
    }

    __returnsMany = true;
}
