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
var point_1 = require("./point");
var util_1 = require("./util");
var circle_1 = require("./circle");
var Arc = /** @class */ (function (_super) {
    __extends(Arc, _super);
    function Arc(c, r, a0, a1) {
        var _this = _super.call(this, c, r) || this;
        var p0 = util_1.default.pointAtAngle(c, r, a0);
        _this.p0 = new ArcPoint(_this, p0.x, p0.y);
        var p1 = util_1.default.pointAtAngle(c, r, a1);
        _this.p1 = new ArcPoint(_this, p1.x, p1.y);
        return _this;
    }
    Arc.prototype.setConstant = function (c) {
        this.c.constant = c;
        this._r.constant = c;
    };
    Object.defineProperty(Arc.prototype, "r", {
        get: function () {
            return this._r.v;
        },
        set: function (v) {
            this._r.v = Math.max(v, 0);
            var p0 = util_1.default.pointInDirection(this.c, this.p0, this.r);
            this.p0.x = p0.x;
            this.p0.y = p0.y;
            var p1 = util_1.default.pointInDirection(this.c, this.p1, this.r);
            this.p1.x = p1.x;
            this.p1.y = p1.y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "angle0", {
        get: function () {
            return util_1.default.getAngleBetween(this.c, this.p0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "angle1", {
        get: function () {
            return util_1.default.getAngleBetween(this.c, this.p1);
        },
        enumerable: true,
        configurable: true
    });
    Arc.prototype.equals = function (other) {
        if (!(other instanceof Arc))
            return false;
        return other.c.equals(this.c) && other.r == this.r &&
            other.angle0 == this.angle0 && other.angle1 == this.angle1;
    };
    Arc.prototype.getChildFigures = function () {
        return [this.c, this.p0, this.p1];
    };
    Arc.prototype.getClosestPoint = function (point) {
        return util_1.default.projectOntoArc(this, point);
    };
    Arc.prototype.translate = function (from, to) {
        this.r = util_1.default.distanceBetweenPoints(to, this.c);
    };
    Arc.prototype.copy = function () {
        return new Arc(this.c.copy(), this.r, this.angle0, this.angle1);
    };
    return Arc;
}(circle_1.default));
exports.default = Arc;
var ArcPoint = /** @class */ (function (_super) {
    __extends(ArcPoint, _super);
    function ArcPoint(arc, x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.arc = arc;
        return _this;
    }
    ArcPoint.prototype.translate = function (from, to) {
        _super.prototype.translate.call(this, from, to);
        this.arc.r = util_1.default.distanceBetweenPoints(this.arc.c, this);
    };
    return ArcPoint;
}(point_1.default));
exports.ArcPoint = ArcPoint;
//# sourceMappingURL=arc.js.map