"use strict";
/**
 * @module gcs/variable
 */
/** */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Value = /** @class */ (function () {
    function Value(v) {
        this.v = v;
        this.constant = false;
    }
    Object.defineProperty(Value.prototype, "v", {
        get: function () {
            return this._v;
        },
        set: function (v) {
            if (!this.constant)
                this._v = v;
        },
        enumerable: true,
        configurable: true
    });
    return Value;
}());
exports.Value = Value;
var Variable = /** @class */ (function () {
    function Variable(v) {
        this._links = [this];
        this._v = new Value(v);
        this._constant = false;
    }
    Object.defineProperty(Variable.prototype, "v", {
        get: function () {
            return this._v.v;
        },
        set: function (v) {
            if (!this._constant)
                this._v.v = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Variable.prototype, "constant", {
        get: function () {
            return this._constant;
        },
        set: function (b) {
            this._constant = b;
            this._v.constant = b;
        },
        enumerable: true,
        configurable: true
    });
    Variable.prototype.linkValues = function (other) {
        // don't link twice!
        if (this._v === other._v)
            return;
        // link
        for (var _i = 0, _a = this._links; _i < _a.length; _i++) {
            var linked = _a[_i];
            // reminder: this._linked includes this
            linked._v = other._v;
        }
        // merge linked for this._linked and other._linked
        // this could be sped up by modify existing arrays instead of creating new ones
        // however, this is much more clear and this functionality is not used very often
        var merged = [];
        merged.push.apply(merged, this._links); // these lists are disjoint
        merged.push.apply(// these lists are disjoint
        merged, other._links);
        for (var _b = 0, merged_1 = merged; _b < merged_1.length; _b++) {
            var linked = merged_1[_b];
            // reminder: this._linked includes this
            linked._links = __spreadArrays(merged);
        }
    };
    Variable.prototype.unlink = function () {
        for (var _i = 0, _a = this._links; _i < _a.length; _i++) {
            var linked = _a[_i];
            if (linked === this)
                continue;
            var index = linked._links.indexOf(this);
            linked._links.splice(index, 1);
        }
        this._links = [this];
        this._v = new Value(this.v);
    };
    return Variable;
}());
exports.default = Variable;
//# sourceMappingURL=variable.js.map