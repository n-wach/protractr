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
var point_1 = require("../geometry/point");
var util_1 = require("../geometry/util");
var RelationTangentLine = /** @class */ (function (_super) {
    __extends(RelationTangentLine, _super);
    function RelationTangentLine(line, circle) {
        var _this = _super.call(this, "tangent line") || this;
        _this.variables = [
            circle._r,
            circle.c._x,
            circle.c._y,
            line.p0._x,
            line.p0._y,
            line.p1._x,
            line.p1._y,
        ];
        _this.line = line;
        _this.circle = circle;
        return _this;
    }
    RelationTangentLine.prototype.getDeltas = function () {
        var deltas = [];
        var projection = util_1.default.projectOntoLine(this.line, this.circle.c);
        var projectionRadius = util_1.default.distanceBetweenPoints(this.circle.c, projection);
        var dr = projectionRadius - this.circle.r;
        deltas.push([this.circle._r, dr]);
        var dx = projection.x - this.circle.c.x;
        var dy = projection.y - this.circle.c.y;
        var da = new point_1.default(dx, dy);
        var normalized = util_1.default.normalize(da);
        var offset = new point_1.default(normalized.x * dr, normalized.y * dr);
        deltas.push([this.circle.c._x, offset.x]);
        deltas.push([this.circle.c._y, offset.y]);
        deltas.push([this.line.p0._x, -offset.x]);
        deltas.push([this.line.p0._y, -offset.y]);
        deltas.push([this.line.p1._x, -offset.x]);
        deltas.push([this.line.p1._y, -offset.y]);
        return deltas;
    };
    RelationTangentLine.prototype.getError = function () {
        var projection = util_1.default.projectOntoLine(this.line, this.circle.c);
        return util_1.default.distanceToCircle(this.circle, projection);
    };
    RelationTangentLine.prototype.getVariables = function () {
        return this.variables;
    };
    return RelationTangentLine;
}(relation_1.default));
exports.default = RelationTangentLine;
//# sourceMappingURL=relationTangentLine.js.map