"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("../main");
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.set = function (p) {
        this.x = p.x;
        this.y = p.y;
    };
    Point.prototype.copy = function () {
        return new Point(this.x, this.y);
    };
    Point.prototype.distTo = function (o) {
        var dx = o.x - this.x;
        var dy = o.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    return Point;
}());
exports.Point = Point;
var PointFigure = /** @class */ (function () {
    function PointFigure(p) {
        this.p = p;
    }
    PointFigure.prototype.draw = function () {
        main_1.ctx.fillStyle = this.selected ? "red" : "black";
        main_1.ctx.beginPath();
        main_1.ctx.arc(this.p.x, this.p.y, 3, 0, Math.PI * 2);
        main_1.ctx.fill();
        main_1.ctx.closePath();
    };
    PointFigure.prototype.getSnappablePoints = function () {
        return [this.p];
    };
    return PointFigure;
}());
exports.PointFigure = PointFigure;
var LineFigure = /** @class */ (function () {
    function LineFigure(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
    LineFigure.prototype.draw = function () {
        main_1.ctx.strokeStyle = this.selected ? "red" : "black";
        main_1.ctx.beginPath();
        main_1.ctx.moveTo(this.p1.p.x, this.p1.p.y);
        main_1.ctx.lineTo(this.p2.p.x, this.p2.p.y);
        main_1.ctx.stroke();
        main_1.ctx.closePath();
        this.p1.draw();
        this.p2.draw();
    };
    LineFigure.prototype.getSnappablePoints = function () {
        return [this.p1.p, this.p2.p];
    };
    return LineFigure;
}());
exports.LineFigure = LineFigure;
var CircleFigure = /** @class */ (function () {
    function CircleFigure(c, r) {
        this.c = c;
        this.r = r;
    }
    CircleFigure.prototype.draw = function () {
        main_1.ctx.strokeStyle = this.selected ? "red" : "black";
        main_1.ctx.beginPath();
        main_1.ctx.arc(this.c.p.x, this.c.p.y, this.r, 0, Math.PI * 2);
        main_1.ctx.stroke();
        main_1.ctx.closePath();
        this.c.draw();
    };
    CircleFigure.prototype.getSnappablePoints = function () {
        return [this.c.p];
    };
    return CircleFigure;
}());
exports.CircleFigure = CircleFigure;
//# sourceMappingURL=figures.js.map