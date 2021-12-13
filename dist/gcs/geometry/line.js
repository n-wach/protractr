"use strict";
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
/**
 * @module gcs/geometry
 */
/** */
var figure_1 = require("./figure");
var util_1 = require("./util");
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(p0, p1) {
        var _this = _super.call(this) || this;
        _this.p0 = p0.copy();
        _this.p1 = p1.copy();
        return _this;
    }
    Line.prototype.getChildFigures = function () {
        return [this.p0, this.p1];
    };
    Line.prototype.getClosestPoint = function (point) {
        return util_1.default.projectOntoSegment(this, point);
    };
    Line.prototype.setConstant = function (c) {
        this.p0.constant = c;
        this.p1.constant = c;
    };
    Line.prototype.translate = function (from, to) {
        var dx = to.x - from.x;
        var dy = to.y - from.y;
        this.p0.x += dx;
        this.p0.y += dy;
        // If the values are linked, we only need to translate one of them
        if (this.p0._x._v !== this.p1._x._v) {
            this.p1.x += dx;
        }
        if (this.p0._y._v !== this.p1._y._v) {
            this.p1.y += dy;
        }
    };
    Line.prototype.equals = function (other) {
        if (!(other instanceof Line))
            return false;
        return other.p0.equals(this.p0) && other.p1.equals(this.p1);
    };
    Line.prototype.copy = function () {
        return new Line(this.p0.copy(), this.p1.copy());
    };
    return Line;
}(figure_1.default));
exports.default = Line;
//# sourceMappingURL=line.js.map