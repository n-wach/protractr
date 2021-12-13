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
var util_1 = require("../geometry/util");
var RelationMidpoint = /** @class */ (function (_super) {
    __extends(RelationMidpoint, _super);
    function RelationMidpoint(point, line) {
        var _this = _super.call(this, "midpoint") || this;
        _this.variables = [
            point._x,
            point._y,
            line.p0._x,
            line.p0._y,
            line.p1._x,
            line.p1._y,
        ];
        _this.midpoint = point;
        _this.line = line;
        return _this;
    }
    RelationMidpoint.prototype.getDeltas = function () {
        var deltas = [];
        var midpoint = util_1.default.averageOfPoints(this.line.p0, this.line.p1);
        deltas.push.apply(deltas, util_1.default.pointDeltas(this.midpoint, midpoint));
        var reflectP0 = util_1.default.reflectOver(this.line.p0, this.midpoint);
        deltas.push.apply(deltas, util_1.default.pointDeltas(this.line.p1, reflectP0));
        var reflectP1 = util_1.default.reflectOver(this.line.p1, this.midpoint);
        deltas.push.apply(deltas, util_1.default.pointDeltas(this.line.p0, reflectP1));
        return deltas;
    };
    RelationMidpoint.prototype.getError = function () {
        var midpoint = util_1.default.averageOfPoints(this.line.p0, this.line.p1);
        return util_1.default.distanceBetweenPoints(this.midpoint, midpoint);
    };
    RelationMidpoint.prototype.getVariables = function () {
        return this.variables;
    };
    return RelationMidpoint;
}(relation_1.default));
exports.default = RelationMidpoint;
//# sourceMappingURL=relationMidpoint.js.map