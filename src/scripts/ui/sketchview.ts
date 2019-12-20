import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "../gcs/figures";
import {UI} from "./ui";

export class SketchView {
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
        for (let event of events) {
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
    }

    handleToolEvent(type: string, point: Point) {
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
        closest = this.ui.protractr.sketch.getClosestFigure(point, [], 10, this.ctxScale);
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
        if (this.ui.infoPane.selectedFiguresList.figureSelected(fig)) {
            this.ctx.strokeStyle = "#5e9cff";
        }
        if (this.hoveredFigure == fig || this.ui.infoPane.selectedFiguresList.figureHovered(fig)) {
            pointSize = 7;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        if (this.ui.infoPane.existingConstraintsList.figureInHovered(fig)) {
            this.ctx.strokeStyle = "purple";
            pointSize = 7;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        switch (fig.type) {
            case "line":
                let line = (fig as LineFigure);
                this.drawLine(line.p1, line.p2);
                if (this.hoveredFigure == fig) {
                    let midpoint = Point.averagePoint(line.p1, line.p2);
                    this.drawPoint(midpoint, pointSize, this.ctx.strokeStyle);
                    this.drawPoint(line.p1, pointSize, this.ctx.strokeStyle);
                    this.drawPoint(line.p2, pointSize, this.ctx.strokeStyle);
                }
                break;
            case "point":
                let point = (fig as PointFigure);
                this.drawPoint(point.p, pointSize, this.ctx.strokeStyle);
                break;
            case "circle":
                let circle = (fig as CircleFigure);
                this.drawCircle(circle.c, circle.r.value);
                break;
        }
    }

    draw() {
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.translate(this.ctxOrigin.x, this.ctxOrigin.y);
        this.ctx.scale(this.ctxScale, this.ctxScale);
        for (let fig of this.ui.protractr.sketch.rootFigures) {
            for (let child of fig.getRelatedFigures()) {
                this.drawFigure(child);
            }
        }
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2 / this.ctxScale;
        this.ui.topBar.activeTool.draw(this);
        this.ui.infoPane.selectedFigureView.refresh();
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
