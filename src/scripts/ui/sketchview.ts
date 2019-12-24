/**
 * @module ui/sketchview
 */
/** */

import UI from "./ui";
import Point from "../gcs/geometry/point";
import Figure from "../gcs/geometry/figure";
import Line from "../gcs/geometry/line";
import Circle from "../gcs/geometry/circle";

export default class SketchView {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    ctxOrigin: Point;
    ctxScale: number;

    hoveredFigure: Figure;
    ui: UI;

    lastPanPoint: Point = null;

    constructor(ui: UI, canvas: HTMLCanvasElement) {
        this.ui = ui;
        this.canvas = canvas;
        this.ctxScale = 1;
        this.ctxOrigin = new Point(0, 0);
        this.ctx = this.canvas.getContext("2d");
        let mouseEventHandler = this.handleMouseEvent.bind(this);
        let events = ["mousemove", "mousedown", "mouseup", "wheel"];
        for(let event of events) {
            this.canvas.addEventListener(event, mouseEventHandler);
        }
    }

    handleZoomEvent(deltaY: number, point: Point) {
        let originalScale = this.ctxScale;
        let s = this.ctxScale - (deltaY * 0.005 * this.ctxScale);
        this.ctxScale = Math.min(10, Math.max(0.1, s));
        let scaleChange = originalScale - this.ctxScale;
        this.ctxOrigin.x += (point.x * scaleChange);
        this.ctxOrigin.y += (point.y * scaleChange);
    }

    handlePanEvent(type: string, offset: Point) {
        switch(type) {
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
    }

    handleToolEvent(type: string, point: Point) {
        switch(type) {
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
    }

    handleMouseEvent(event: MouseEvent & WheelEvent) {
        event.preventDefault();
        let offset = new Point(event.offsetX, event.offsetY);
        let scaled = new Point(offset.x / this.ctxScale, offset.y / this.ctxScale);
        let point = new Point(scaled.x - this.ctxOrigin.x / this.ctxScale, scaled.y - this.ctxOrigin.y / this.ctxScale);
        this.updateHover(point);
        if (event.type == "wheel") {
            let delta = event.deltaY;
            //convert delta into pixels...
            if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
                delta *= 16; // just a guess--depends on inaccessible user settings
            } else if (event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
                delta *= 800;  // also just a guess--no good way to predict these...
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
    }

    updateHover(point: Point) {
        let closest;
        closest = this.ui.protractr.sketch.getClosestFigure(point, this.ctxScale, 10);
        this.hoveredFigure = closest;
        if (this.hoveredFigure != null) {
            this.setCursor("move");
        } else {
            this.setCursor("default");
        }
    }

    setCursor(cursor: string) {
        this.canvas.style.cursor = cursor;
    }

    drawFigure(fig: Figure) {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2 / this.ctxScale;
        let pointSize = 3;
        if (this.ui.selectedFigures.contains(fig)) {
            this.ctx.strokeStyle = "#5e9cff";
        }
        if (this.hoveredFigure == fig || this.ui.boldFigures.contains(fig)) {
            pointSize = 7;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        if (this.ui.selectedRelations.elements.some((r) => r.containsFigure(fig))) {
            this.ctx.strokeStyle = "purple";
            pointSize = 7;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        if(fig instanceof Point) {
            this.drawPoint(fig, pointSize, this.ctx.strokeStyle);
        } else if (fig instanceof Line) {
            this.drawLine(fig.p0, fig.p1);
        } else if (fig instanceof Circle) {
            this.drawCircle(fig.c, fig.r);
        }
    }

    draw() {
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.translate(this.ctxOrigin.x, this.ctxOrigin.y);
        this.ctx.scale(this.ctxScale, this.ctxScale);
        for(let fig of this.ui.protractr.sketch.figures) {
            this.drawFigure(fig);
            for(let child of fig.getChildFigures()) {
                this.drawFigure(child);
            }
        }
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2 / this.ctxScale;
        this.ui.topBar.activeTool.draw(this);
    }

    drawPoint(point: Point, size: number = 3, color: string = "black") {
        if (!point) return;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        this.ctx.arc(point.x, point.y, size / this.ctxScale, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawLine(p1: Point, p2: Point) {
        if (!p1 || !p2) return;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
    }

    drawCircle(center: Point, radius: number) {
        if (!center) return;
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
}
