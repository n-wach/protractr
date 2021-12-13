"use strict";
/**
 * @module gcs/relations
 */
/** */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var relation_1 = require("./relation");
/**
 * Used to set multiple variables equal.  For instance,
 * horizontal/vertical points, or equal radius circles.
 * WARNING: this relation is unique in that it immediately links
 * variables and becomes active.  It does not need to be added to
 * a sketch to take affect...
 */
var RelationEqual = /** @class */ (function (_super) {
    __extends(RelationEqual, _super);
    function RelationEqual(name) {
        var variables = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            variables[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this, name) || this;
        _this.variables = variables;
        var root = _this.variables[0];
        for (var i = 1; i < _this.variables.length; i++) {
            _this.variables[i].linkValues(root);
        }
        return _this;
    }
    RelationEqual.prototype.getDeltas = function () {
        return [];
    };
    RelationEqual.prototype.getError = function () {
        return 0;
    };
    RelationEqual.prototype.getVariables = function () {
        return this.variables;
    };
    RelationEqual.prototype.remove = function () {
        for (var _i = 0, _a = this.variables; _i < _a.length; _i++) {
            var variable = _a[_i];
            variable.unlink();
        }
    };
    return RelationEqual;
}(relation_1.default));
exports.default = RelationEqual;
//# sourceMappingURL=relationEqual.js.map