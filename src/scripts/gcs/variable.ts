export default class Variable {
    private _v: number;
    constant: boolean;

    get v() {
        return this._v;
    }

    set v(v: number) {
        if (!this.constant) this._v = v;
    }

    constructor(v: number) {
        this.v = v;
        this.constant = false;
    }
}
