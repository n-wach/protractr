"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var figures_1 = require("./gcs/figures");
var toolbar_1 = require("./ui/toolbar");
var main_1 = require("./main");
var Protractr = /** @class */ (function () {
    function Protractr(ctx, sidePane, toolbar) {
        this.figures = [];
        console.debug(this);
        this.ctx = ctx;
        this.toolbar = new toolbar_1.Toolbar(this, toolbar);
        this.sidePane = sidePane;
        this.ctx.canvas.addEventListener("touchdown", this.canvasDown.bind(this));
        this.ctx.canvas.addEventListener("mousedown", this.canvasDown.bind(this));
        this.ctx.canvas.addEventListener("touchup", this.canvasUp.bind(this));
        this.ctx.canvas.addEventListener("mouseup", this.canvasUp.bind(this));
        this.ctx.canvas.addEventListener("touchmove", this.canvasMove.bind(this));
        this.ctx.canvas.addEventListener("mousemove", this.canvasMove.bind(this));
    }
    Protractr.prototype.canvasDown = function (event) {
        var point = getRelativeCoords(event);
        if (this.toolbar.activeTool) {
            this.toolbar.activeTool.down(snapCoords(point));
        }
        this.draw();
    };
    Protractr.prototype.canvasUp = function (event) {
        var point = getRelativeCoords(event);
        if (this.toolbar.activeTool) {
            this.toolbar.activeTool.up(snapCoords(point));
        }
        this.draw();
    };
    Protractr.prototype.canvasMove = function (event) {
        var point = getRelativeCoords(event);
        if (this.toolbar.activeTool) {
            this.toolbar.activeTool.move(snapCoords(point));
        }
        this.draw();
    };
    Protractr.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var _i = 0, _a = this.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            fig.draw();
        }
    };
    Protractr.prototype.getAllSnappablePoints = function () {
        var points = [];
        for (var _i = 0, _a = this.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            if (fig.selected)
                continue;
            for (var _b = 0, _c = fig.getSnappablePoints(); _b < _c.length; _b++) {
                var p = _c[_b];
                points.push(p);
            }
        }
        return points;
    };
    return Protractr;
}());
exports.Protractr = Protractr;
function snapCoords(point) {
    var points = main_1.protractr.getAllSnappablePoints();
    var closest = point;
    var closestDist = 10;
    for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
        var p = points_1[_i];
        var d = p.distTo(point);
        if (d < closestDist) {
            closest = p;
            closestDist = d;
        }
    }
    return closest.copy();
}
function getRelativeCoords(event) {
    return new figures_1.Point(event.offsetX, event.offsetY);
}
//# sourceMappingURL=protractr.js.map