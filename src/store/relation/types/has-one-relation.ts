import {Relation} from "./relation";

export class HasOneRelation extends Relation {

    constructor(givenModelName: string, foreignKey?: string, localKey?: string) {
        super(givenModelName);
    }

    __returnsMany = false;

}
