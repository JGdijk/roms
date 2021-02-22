export class OrderByStatement {

    private key: string;

    private ord: 'desc' | 'asc';

    constructor(key: string, order?: 'desc' | 'asc' | undefined) {
        this.key = key;
        this.ord = (order) ? order : 'asc';
    }

    public order(data: any[]): any[] {

        // todo we have to throw a big error when the key of the order doesn't exist on the object

        let desc = (this.ord === 'desc');

        return data.sort((obj1, obj2) => {
            if (Number.isInteger(obj1[this.key]) && Number.isInteger(obj2[this.key])) {
                return (desc)
                    ? obj2[this.key] - obj1[this.key]
                    : obj1[this.key] - obj2[this.key];
            }

            if (Number.isInteger(obj1[this.key])) return (desc) ? -1 : 1;
            if (Number.isInteger(obj2[this.key])) return (desc) ? 1 : -1;

            const a = (obj1[this.key]) ? obj1[this.key] : '';
            const b = (obj2[this.key]) ? obj2[this.key] : '';

            return (desc)
                ? b.localeCompare(a)
                : a.localeCompare(b);
        });
    }

}
