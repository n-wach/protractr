"use strict";
/**
 * @module gcs/geometry
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
var variable_1 = require("../variable");
var figure_1 = require("./figure");
var Point = /** @class */ (function (_super) {
    __extends(Point, _super);
    function Point(x, y) {
        var _this = _super.call(this) || this;
        _this.labelPosition = "center";
        _this._x = new variable_1.default(x);
        _this._y = new variable_1.default(y);
        return _this;
    }
    Object.defineProperty(Point.prototype, "x", {
        get: function () {
            return this._x.v;
        },
        set: function (v) {
            this._x.v = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Point.prototype, "y", {
        get: function () {
            return this._y.v;
        },
        set: function (v) {
            this._y.v = v;
        },
        enumerable: true,
        configurable: true
    });
    Point.prototype.getChildFigures = function () {
        return [];
    };
    Point.prototype.getClosestPoint = function (point) {
        return this.copy();
    };
    Point.prototype.setConstant = function (c) {
        this._x.constant = c;
        this._y.constant = c;
    };
    Point.prototype.translate = function (from, to) {
        this.x = to.x;
        this.y = to.y;
    };
    Point.prototype.equals = function (other) {
        if (!(other instanceof Point))
            return false;
        return other.x == this.x && other.y == this.y;
    };
    Point.prototype.copy = function () {
        return new Point(this.x, this.y);
    };
    return Point;
}(figure_1.default));
exports.default = Point;
//# sourceMappingURL=point.js.map