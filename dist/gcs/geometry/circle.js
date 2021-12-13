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
var variable_1 = require("../variable");
var figure_1 = require("./figure");
var util_1 = require("./util");
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(c, r) {
        var _this = _super.call(this) || this;
        _this.c = c.copy();
        _this._r = new variable_1.default(r);
        return _this;
    }
    Circle.prototype.setConstant = function (c) {
        this.c.constant = c;
        this._r.constant = c;
    };
    Object.defineProperty(Circle.prototype, "r", {
        get: function () {
            return this._r.v;
        },
        set: function (v) {
            this._r.v = Math.max(v, 0);
        },
        enumerable: true,
        configurable: true
    });
    Circle.prototype.equals = function (other) {
        if (!(other instanceof Circle))
            return false;
        return other.c.equals(this.c) && other.r == this.r;
    };
    Circle.prototype.getChildFigures = function () {
        return [this.c];
    };
    Circle.prototype.getClosestPoint = function (point) {
        return util_1.default.projectOntoCircle(this, point);
    };
    Circle.prototype.translate = function (from, to) {
        this.r = util_1.default.distanceBetweenPoints(to, this.c);
    };
    Circle.prototype.copy = function () {
        return new Circle(this.c.copy(), this.r);
    };
    return Circle;
}(figure_1.default));
exports.default = Circle;
//# sourceMappingURL=circle.js.map