export class Value {
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

export default class Variable {
    _v: Value;
    _constant: boolean;
    _links: Variable[] = [this];

    constructor(v: number) {
        this._v = new Value(v);
        this._constant = false;
    }

    get v() {
        return this._v.v;
    }

    set v(v: number) {
        if (!this._constant) this._v.v = v;
    }

    get constant() {
        return this._constant;
    }

    set constant(b: boolean) {
        this._constant = b;
        this._v.constant = b;
    }

    linkValues(other: Variable) {
        // don't link twice!
        if(this._v === other._v) return;

        // link
        for(let linked of this._links) {
            // reminder: this._linked includes this
            linked._v = other._v;
        }

        // merge linked for this._linked and other._linked
        // this could be sped up by modify existing arrays instead of creating new ones
        // however, this is much more clear and this functionality is not used very often
        let merged: Variable[] = [];
        merged.push(...this._links);
        merged.push(...other._links);

        for(let linked of merged) {
            // reminder: this._linked includes this
            linked._links = [...merged];
        }
    }

    unlink() {
        if(this._links.length == 1) return;
        for(let linked of this._links) {
            if(linked === this) continue;
            let index = linked._links.indexOf(this);
            linked._links.splice(index, 1);
        }
        this._v = new Value(this.v);
    }
}
