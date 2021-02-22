import {Relation} from "./relation";

export class BelongsToRelation extends Relation {

    constructor(model: string, foreignKey?: string, ownerKey?: string) {
        super(model);
    }

    __returnsMany = false;
}
