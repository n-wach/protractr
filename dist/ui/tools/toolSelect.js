"use strict";
/**
 * @module ui/tools
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
var tool_1 = require("./tool");
var point_1 = require("../../gcs/geometry/point");
var util_1 = require("../../gcs/geometry/util");
var line_1 = require("../../gcs/geometry/line");
var circle_1 = require("../../gcs/geometry/circle");
var ToolSelect = /** @class */ (function (_super) {
    __extends(ToolSelect, _super);
    function ToolSelect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ToolSelect.prototype.down = function (point) {
        this.pressed = true;
        this.downFigure = this.getFigureNearPoint(point);
        if (!this.downFigure) {
            this.protractr.ui.selectedFigures.clear();
            this.selectionStart = point;
            this.selectionEnd = point;
        }
        else {
            this.lastDrag = point.copy();
        }
    };
    ToolSelect.prototype.up = function (point) {
        if (this.downFigure) {
            this.protractr.sketch.solveWithConstantFigures([this.downFigure], true);
            this.protractr.ui.pushState();
            this.protractr.ui.update();
        }
        if (!this.dragging && this.downFigure) {
            this.protractr.ui.selectedFigures.togglePresence(this.downFigure);
        }
        this.reset();
    };
    ToolSelect.prototype.move = function (point) {
        var _a;
        if (this.pressed)
            this.dragging = true;
        if (this.downFigure && this.dragging) {
            this.downFigure.translate(this.lastDrag, point.copy());
            this.protractr.sketch.solveWithConstantFigures([this.downFigure]);
            this.lastDrag = point.copy();
            this.protractr.ui.update();
        }
        else {
            this.selectionEnd = point;
            if (this.selectionStart) {
                var selection = [];
                for (var _i = 0, _b = this.protractr.sketch.figures; _i < _b.length; _i++) {
                    var figure = _b[_i];
                    if (this.figureShouldBeSelected(figure)) {
                        selection.push(figure);
                    }
                    for (var _c = 0, _d = figure.getChildFigures(); _c < _d.length; _c++) {
                        var relatedFigure = _d[_c];
                        if (this.figureShouldBeSelected(relatedFigure)) {
                            selection.push(relatedFigure);
                        }
                    }
                }
                (_a = this.protractr.ui.selectedFigures).set.apply(_a, selection);
            }
        }
    };
    ToolSelect.prototype.draw = function (sketchView) {
        if (!this.selectionStart || !this.selectionEnd)
            return;
        var w = this.selectionEnd.x - this.selectionStart.x;
        var h = this.selectionEnd.y - this.selectionStart.y;
        sketchView.ctx.fillStyle = "green";
        sketchView.ctx.globalAlpha = 0.5;
        sketchView.ctx.fillRect(this.selectionStart.x, this.selectionStart.y, w, h);
        sketchView.ctx.globalAlpha = 1;
        sketchView.ctx.strokeStyle = "green";
        sketchView.ctx.strokeRect(this.selectionStart.x, this.selectionStart.y, w, h);
    };
    ToolSelect.prototype.reset = function () {
        this.selectionEnd = null;
        this.selectionStart = null;
        this.dragging = false;
        this.pressed = false;
    };
    ToolSelect.prototype.figureInRectangle = function (figure) {
        if (figure instanceof point_1.default) {
            return util_1.default.pointWithinRectangle(this.selectionStart, this.selectionEnd, figure);
        }
        var p0 = this.selectionStart;
        var p1 = new point_1.default(this.selectionStart.x, this.selectionEnd.y);
        var p2 = this.selectionEnd;
        var p3 = new point_1.default(this.selectionEnd.x, this.selectionStart.y);
        var l0 = new line_1.default(p0, p1);
        var l1 = new line_1.default(p1, p2);
        var l2 = new line_1.default(p2, p3);
        var l3 = new line_1.default(p3, p0);
        if (figure instanceof line_1.default) {
            if (this.figureInRectangle(figure.p0) || this.figureInRectangle(figure.p1)) {
                return true;
            }
            //test if line intersects any of the edges
            if (util_1.default.segmentsIntersect(l0, figure))
                return true;
            if (util_1.default.segmentsIntersect(l1, figure))
                return true;
            if (util_1.default.segmentsIntersect(l2, figure))
                return true;
            if (util_1.default.segmentsIntersect(l3, figure))
                return true;
            return false;
        }
        else if (figure instanceof circle_1.default) {
            var p0In = util_1.default.pointWithinCircle(figure, p0);
            var p1In = util_1.default.pointWithinCircle(figure, p1);
            var p2In = util_1.default.pointWithinCircle(figure, p2);
            var p3In = util_1.default.pointWithinCircle(figure, p3);
            var allInside = p0In && p1In && p2In && p3In;
            if (allInside)
                return false;
            var allOutside = !p0In && !p1In && !p2In && !p3In;
            if (!allOutside)
                return true;
            // shortcut!
            if (this.figureInRectangle(figure.c))
                return true;
            // technically, because the rectangle is axis-bounded, we could just check 4 points on the circle
            // but this is more intuitive
            if (util_1.default.lineIntersectsCircle(figure, l0))
                return true;
            if (util_1.default.lineIntersectsCircle(figure, l1))
                return true;
            if (util_1.default.lineIntersectsCircle(figure, l2))
                return true;
            if (util_1.default.lineIntersectsCircle(figure, l3))
                return true;
            return false;
        }
        return false;
    };
    ToolSelect.prototype.figureShouldBeSelected = function (figure) {
        return this.figureInRectangle(figure);
    };
    return ToolSelect;
}(tool_1.default));
exports.default = ToolSelect;
//# sourceMappingURL=toolSelect.js.map