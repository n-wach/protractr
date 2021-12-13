"use strict";
/**
 * @module ui/sketchview
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var point_1 = require("../gcs/geometry/point");
var line_1 = require("../gcs/geometry/line");
var circle_1 = require("../gcs/geometry/circle");
var arc_1 = require("../gcs/geometry/arc");
var SketchView = /** @class */ (function () {
    function SketchView(ui, canvas) {
        this.lastPanPoint = null;
        this.ui = ui;
        this.canvas = canvas;
        this.ctxScale = 1;
        this.ctxOrigin = new point_1.default(0, 0);
        this.ctx = this.canvas.getContext("2d");
        var mouseEventHandler = this.handleMouseEvent.bind(this);
        var events = ["mousemove", "mousedown", "mouseup", "wheel"];
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var event_1 = events_1[_i];
            this.canvas.addEventListener(event_1, mouseEventHandler);
        }
    }
    SketchView.prototype.handleZoomEvent = function (deltaY, point) {
        var originalScale = this.ctxScale;
        var s = this.ctxScale - (deltaY * 0.005 * this.ctxScale);
        this.ctxScale = Math.min(10, Math.max(0.1, s));
        var scaleChange = originalScale - this.ctxScale;
        this.ctxOrigin.x += (point.x * scaleChange);
        this.ctxOrigin.y += (point.y * scaleChange);
    };
    SketchView.prototype.handlePanEvent = function (type, offset) {
        switch (type) {
            case "mousedown":
                this.lastPanPoint = offset.copy();
                break;
            case "mousemove":
                this.ctxOrigin.x += offset.x - this.lastPanPoint.x;
                this.ctxOrigin.y += offset.y - this.lastPanPoint.y;
                this.lastPanPoint = offset.copy();
                break;
            case "mouseup":
                this.lastPanPoint = null;
                break;
        }
    };
    SketchView.prototype.handleToolEvent = function (type, point) {
        switch (type) {
            case "mousedown":
                this.ui.topBar.activeTool.down(point);
                break;
            case "mousemove":
                this.ui.topBar.activeTool.move(point);
                break;
            case "mouseup":
                this.ui.topBar.activeTool.up(point);
                break;
        }
    };
    SketchView.prototype.handleMouseEvent = function (event) {
        event.preventDefault();
        var offset = new point_1.default(event.offsetX, event.offsetY);
        var scaled = new point_1.default(offset.x / this.ctxScale, offset.y / this.ctxScale);
        var point = new point_1.default(scaled.x - this.ctxOrigin.x / this.ctxScale, scaled.y - this.ctxOrigin.y / this.ctxScale);
        this.updateHover(point);
        if (event.type == "wheel") {
            var delta = event.deltaY;
            //convert delta into pixels...
            if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
                delta *= 16; // just a guess--depends on inaccessible user settings
            }
            else if (event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
                delta *= 800; // also just a guess--no good way to predict these...
            }
            this.handleZoomEvent(delta, point);
        }
        if (event.which == 2 || (event.type == "mousemove" && this.lastPanPoint != null)) {
            this.handlePanEvent(event.type, offset);
        }
        if (event.which == 1 || event.type == "mousemove") {
            this.handleToolEvent(event.type, point);
        }
        this.draw();
    };
    SketchView.prototype.updateHover = function (point) {
        var closest;
        closest = this.ui.protractr.sketch.getClosestFigure(point, this.ctxScale, 10);
        this.hoveredFigure = closest;
        if (this.hoveredFigure != null) {
            this.setCursor("move");
        }
        else {
            this.setCursor("default");
        }
    };
    SketchView.prototype.setCursor = function (cursor) {
        this.canvas.style.cursor = cursor;
    };
    SketchView.prototype.drawFigure = function (fig) {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2 / this.ctxScale;
        var pointSize = 3;
        if (this.ui.selectedFigures.contains(fig)) {
            this.ctx.strokeStyle = "#5e9cff";
        }
        if (this.hoveredFigure == fig || this.ui.boldFigures.contains(fig)) {
            pointSize = 7;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        if (this.ui.selectedRelations.elements.some(function (r) { return r.containsFigure(fig); })) {
            this.ctx.strokeStyle = "purple";
            pointSize = 7;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        if (fig instanceof point_1.default) {
            this.drawPoint(fig, pointSize, this.ctx.strokeStyle);
        }
        else if (fig instanceof line_1.default) {
            this.drawLine(fig.p0, fig.p1);
        }
        else if (fig instanceof arc_1.default) {
            this.drawArc(fig.c, fig.r, fig.angle0, fig.angle1);
        }
        else if (fig instanceof circle_1.default) {
            this.drawCircle(fig.c, fig.r);
        }
    };
    SketchView.prototype.draw = function () {
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.translate(this.ctxOrigin.x, this.ctxOrigin.y);
        this.ctx.scale(this.ctxScale, this.ctxScale);
        for (var _i = 0, _a = this.ui.protractr.sketch.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            this.drawFigure(fig);
            for (var _b = 0, _c = fig.getChildFigures(); _b < _c.length; _b++) {
                var child = _c[_b];
                this.drawFigure(child);
            }
        }
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2 / this.ctxScale;
        this.ui.topBar.activeTool.draw(this);
    };
    SketchView.prototype.drawPoint = function (point, size, color) {
        if (size === void 0) { size = 3; }
        if (color === void 0) { color = "black"; }
        if (!point)
            return;
        this.ctx.fillStyle = color;
        if (point.label && point.labelPosition == "center") {
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.font = 20 / this.ctxScale + "px serif";
            this.ctx.fillText(point.label, point.x, point.y);
        }
        else {
            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);
            this.ctx.arc(point.x, point.y, size / this.ctxScale, 0, Math.PI * 2);
            this.ctx.fill();
            if (point.label && point.labelPosition) {
                this.ctx.font = 20 / this.ctxScale + "px serif";
                switch (point.labelPosition) {
                    case "below":
                        this.ctx.textAlign = "center";
                        this.ctx.textBaseline = "top";
                        this.ctx.fillText(point.label, point.x, point.y + 3 / this.ctxScale);
                        break;
                    case "above":
                        this.ctx.textAlign = "center";
                        this.ctx.textBaseline = "bottom";
                        this.ctx.fillText(point.label, point.x, point.y - 3 / this.ctxScale);
                        break;
                    case "left":
                        this.ctx.textAlign = "right";
                        this.ctx.textBaseline = "middle";
                        this.ctx.fillText(point.label, point.x - 10 / this.ctxScale, point.y);
                        break;
                    case "right":
                        this.ctx.textAlign = "left";
                        this.ctx.textBaseline = "middle";
                        this.ctx.fillText(point.label, point.x + 10 / this.ctxScale, point.y);
                        break;
                }
            }
        }
    };
    SketchView.prototype.drawLine = function (p1, p2) {
        if (!p1 || !p2)
            return;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
    };
    SketchView.prototype.drawCircle = function (center, radius) {
        if (!center)
            return;
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    };
    SketchView.prototype.drawArc = function (center, radius, a0, a1) {
        if (!center)
            return;
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, a0, a1);
        this.ctx.stroke();
    };
    return SketchView;
}());
exports.default = SketchView;
//# sourceMappingURL=sketchview.js.map