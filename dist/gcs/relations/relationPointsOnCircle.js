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
var line_1 = require("../geometry/line");
var util_1 = require("../geometry/util");
var RelationPointsOnCircle = /** @class */ (function (_super) {
    __extends(RelationPointsOnCircle, _super);
    function RelationPointsOnCircle(circle) {
        var points = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            points[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this, "points on circle") || this;
        _this.variables = [
            circle._r,
            circle.c._x,
            circle.c._y,
        ];
        for (var _a = 0, points_1 = points; _a < points_1.length; _a++) {
            var point = points_1[_a];
            _this.variables.push(point._x);
            _this.variables.push(point._y);
        }
        _this.points = points;
        _this.circle = circle;
        return _this;
    }
    RelationPointsOnCircle.prototype.getDeltas = function () {
        var deltas = [];
        var totalDistance = 0;
        var centerXDelta = 0;
        var centerYDelta = 0;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            var dist = util_1.default.distanceBetweenPoints(point, this.circle.c);
            totalDistance += dist;
            var goalPoint = util_1.default.projectOntoCircle(this.circle, point);
            deltas.push.apply(deltas, util_1.default.pointDeltas(point, goalPoint));
            if (dist == 0)
                continue;
            var d = this.circle.r / dist;
            var dx = point.x - this.circle.c.x;
            var dy = point.y - this.circle.c.y;
            centerXDelta += (1 - d) * dx;
            centerYDelta += (1 - d) * dy;
        }
        var averageRadius = totalDistance / this.points.length;
        var dr = averageRadius - this.circle.r;
        deltas.push([this.circle._r, dr]);
        deltas.push([this.circle.c._x, centerXDelta]);
        deltas.push([this.circle.c._y, centerYDelta]);
        return deltas;
    };
    RelationPointsOnCircle.prototype.getError = function () {
        var error = 0;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            error += util_1.default.distanceToCircle(this.circle, point);
        }
        return error;
    };
    RelationPointsOnCircle.prototype.getVariables = function () {
        return this.variables;
    };
    RelationPointsOnCircle.prototype.containsFigure = function (figure) {
        if (figure instanceof line_1.default)
            return false;
        return _super.prototype.containsFigure.call(this, figure);
    };
    return RelationPointsOnCircle;
}(relation_1.default));
exports.default = RelationPointsOnCircle;
//# sourceMappingURL=relationPointsOnCircle.js.map