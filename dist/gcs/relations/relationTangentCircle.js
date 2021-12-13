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
var line_1 = require("../geometry/line");
var util_1 = require("../geometry/util");
var RelationTangentCircle = /** @class */ (function (_super) {
    __extends(RelationTangentCircle, _super);
    function RelationTangentCircle(circle0, circle1) {
        var _this = _super.call(this, "tangent circle") || this;
        _this.variables = [
            circle0._r,
            circle0.c._x,
            circle0.c._y,
            circle1._r,
            circle1.c._x,
            circle1.c._y,
        ];
        _this.circle0 = circle0;
        _this.circle1 = circle1;
        return _this;
    }
    RelationTangentCircle.prototype.getDeltas = function () {
        var deltas = [];
        var delta = 0;
        var c0Goal = null;
        var c1Goal = null;
        var dist = util_1.default.distanceBetweenPoints(this.circle0.c, this.circle1.c);
        if (dist >= Math.max(this.circle0.r, this.circle1.r)) {
            // circle centers are outside of each other
            var radiusSum = this.circle0.r + this.circle1.r;
            delta = dist - radiusSum;
            deltas.push([this.circle0._r, delta]);
            deltas.push([this.circle1._r, delta]);
            c0Goal = util_1.default.pointInDirection(this.circle0.c, this.circle1.c, delta);
            c1Goal = util_1.default.pointInDirection(this.circle1.c, this.circle0.c, delta);
        }
        else {
            // the circle with the smaller radius is inside the other circle
            if (this.circle0.r < this.circle1.r) {
                // circle0 inside circle1
                // delta is how to change r0
                delta = this.circle1.r - (dist + this.circle0.r);
                deltas.push([this.circle0._r, delta]);
                deltas.push([this.circle1._r, -delta]);
            }
            else {
                // circle1 inside circle0
                // delta is how to change r1
                delta = this.circle0.r - (dist + this.circle1.r);
                deltas.push([this.circle0._r, -delta]);
                deltas.push([this.circle1._r, delta]);
            }
            c0Goal = util_1.default.pointInDirection(this.circle0.c, this.circle1.c, -delta);
            c1Goal = util_1.default.pointInDirection(this.circle1.c, this.circle0.c, -delta);
        }
        deltas.push.apply(deltas, util_1.default.pointDeltas(this.circle0.c, c0Goal));
        deltas.push.apply(deltas, util_1.default.pointDeltas(this.circle1.c, c1Goal));
        return deltas;
    };
    RelationTangentCircle.prototype.getError = function () {
        var dist = util_1.default.distanceBetweenPoints(this.circle0.c, this.circle1.c);
        if (dist > Math.max(this.circle0.r, this.circle1.r)) {
            // circle centers are outside of each other
            var radiusSum = this.circle0.r + this.circle1.r;
            return Math.abs(dist - radiusSum);
        }
        else {
            // the circle with the smaller radius is inside the other circle
            if (this.circle0.r < this.circle1.r) {
                //circle0 inside circle1
                return Math.abs(this.circle1.r - (dist + this.circle0.r));
            }
            else {
                //circle1 inside circle0
                return Math.abs(this.circle0.r - (dist + this.circle1.r));
            }
        }
    };
    RelationTangentCircle.prototype.getVariables = function () {
        return this.variables;
    };
    RelationTangentCircle.prototype.containsFigure = function (figure) {
        if (figure instanceof point_1.default)
            return false;
        if (figure instanceof line_1.default)
            return false;
        return _super.prototype.containsFigure.call(this, figure);
    };
    return RelationTangentCircle;
}(relation_1.default));
exports.default = RelationTangentCircle;
//# sourceMappingURL=relationTangentCircle.js.map