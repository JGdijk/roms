export abstract class Relation {

    protected abstract __returnsMany: boolean;

    private givenModelName: string;

    protected constructor(givenModelName: string) {
        this.givenModelName = givenModelName.toLowerCase();
    }

    public returnsMany(): boolean {
        return this.__returnsMany;
    }

    public getName(): string {
        return this.givenModelName
    }

}
