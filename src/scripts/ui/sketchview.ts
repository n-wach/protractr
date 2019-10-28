import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "../gcs/figures";
import {Sketch} from "../gcs/sketch";
import {Tool} from "./tools";
import {UI} from "./ui";

export class SketchView {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    ctxOrigin: Point;
    ctxScale: number;

    sketch: Sketch;
    subscribedTool: Tool;
    hoveredFigure: Figure;
    selectedFigures: Figure[];
    ui: UI;
    lastDrag: Point;

    draggedFigure: Figure;
    lastFigureDrag: Point;
    dragging: boolean = false;

    lastPanPoint: Point = null;

    constructor(ui: UI, sketch: Sketch, canvas: HTMLCanvasElement) {
        this.ui = ui;
        this.sketch = sketch;
        this.canvas = canvas;
        this.selectedFigures = [];
        this.ctxScale = 1;
        this.ctxOrigin = new Point(0, 0);
        this.updateSelected();
        this.ctx = this.canvas.getContext("2d");
        let mouseEventHandler = this.handleMouseEvent.bind(this);
        let events = ["mousemove", "mousedown", "mouseup", "wheel"];
        for(let event of events) {
            this.canvas.addEventListener(event, mouseEventHandler);
        }
    }
    handleZoomEvent(deltaY: number, point: Point) {
        let originalScale = this.ctxScale;
        this.ctxScale = this.ctxScale - (deltaY * 0.05 * this.ctxScale);
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
                this.subscribedTool.down(point);
                break;
            case "mousemove":
                this.subscribedTool.move(point);
                break;
            case "mouseup":
                this.subscribedTool.up(point);
                break;
        }
    }
    handleDragEvent(type: string, point: Point) {
        switch (type) {
            case "mousedown":
                if (this.hoveredFigure) {
                    this.dragging = false;
                    this.draggedFigure = this.hoveredFigure;
                    this.lastFigureDrag = point.copy();
                }
                break;
            case "mousemove":
                if (this.draggedFigure != null) {
                    this.dragging = true;
                    this.draggedFigure.setLocked(false);
                    this.draggedFigure.translate(this.lastFigureDrag, point.copy());
                    this.draggedFigure.setLocked(true);
                    this.lastFigureDrag = point.copy();
                    this.sketch.solveConstraints();
                }
                break;
            case "mouseup":
                if (this.dragging === false) {
                    if (this.hoveredFigure) {
                        this.toggleSelected(this.hoveredFigure);
                    } else {
                        this.selectedFigures = [];
                        this.updateSelected();
                    }
                }
                if(this.draggedFigure) {
                    this.draggedFigure.setLocked(false);
                    this.draggedFigure = null;
                    this.sketch.solveConstraints(true);
                }
                this.dragging = false;
                break;
        }
    }
    handleMouseEvent(event) {
        event.preventDefault();
        let offset = new Point(event.offsetX, event.offsetY);
        let scaled = new Point(offset.x / this.ctxScale, offset.y / this.ctxScale);
        let point = new Point(scaled.x - this.ctxOrigin.x / this.ctxScale, scaled.y - this.ctxOrigin.y / this.ctxScale);
        this.updateHover(point);
        let snapPoint = point; //this.snapPoint(point);
        if(event.type == "wheel") {
            this.handleZoomEvent(event.deltaY, point);
        }
        if(event.which == 2 || (event.type == "mousemove" && this.lastPanPoint != null)) {
            this.handlePanEvent(event.type, offset);
        }
        if(event.which == 1) {
            if(this.subscribedTool) {
                this.handleToolEvent(event.type, snapPoint);
            } else {
                this.handleDragEvent(event.type, snapPoint);
            }
        }
        this.draw();
    }
    updateHover(point) {
        let closest;
        let ignoredFigures = [];
        if (this.subscribedTool && this.subscribedTool.currentFigure) {
            ignoredFigures.push.apply(ignoredFigures, this.subscribedTool.currentFigure.getRelatedFigures());
        }
        if(this.draggedFigure && this.dragging) {
            ignoredFigures.push.apply(ignoredFigures, this.draggedFigure.getRelatedFigures());
        }
        closest = this.sketch.getClosestFigure(point, ignoredFigures);
        if(closest != null && closest.getClosestPoint(point).distTo(point) > 10 / this.ctxScale) {
            closest = null;
        }
        this.hoveredFigure = closest;
        if(this.hoveredFigure != null) {
            this.setCursor("move");
        } else {
            this.setCursor("default");
        }
    }
    subscribeTool(tool: Tool) {
        this.subscribedTool = tool;
    }
    snapPoint(point: Point): Point {
        if(!this.hoveredFigure) return point;
        return this.hoveredFigure.getClosestPoint(point);
    }
    toggleSelected(fig: Figure) {
        if(this.selectedFigures.indexOf(fig) == -1) {
            this.selectedFigures.push(fig);
        } else {
            this.selectedFigures = this.selectedFigures.filter(function(value, index, arr){
                return value != fig;
            });
        }
        this.updateSelected();
    }
    updateSelected() {
        this.ui.infoPane.setFocusedFigures(this.selectedFigures);
    }
    setCursor(cursor: string) {
        this.canvas.style.cursor = cursor;
    }

    drawFigure(fig: Figure) {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2 / this.ctxScale;
        let pointSize = 3 / this.ctxScale;
        if(this.hoveredFigure == fig) {
            pointSize = 5 / this.ctxScale;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        if (this.selectedFigures.indexOf(fig) != -1) {
            this.ctx.strokeStyle = "#5e9cff";
        }
        switch(fig.type) {
            case "line":
                let line = (fig as LineFigure);
                this.ctx.beginPath();
                this.ctx.moveTo(line.p1.x, line.p1.y);
                this.ctx.lineTo(line.p2.x, line.p2.y);
                this.ctx.stroke();
                break;
            case "point":
                let point = (fig as PointFigure);
                this.drawPoint(point.p, pointSize, this.ctx.strokeStyle);
                break;
            case "circle":
                let circle = (fig as CircleFigure);
                this.ctx.beginPath();
                this.ctx.arc(circle.c.x, circle.c.y, circle.r.value, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
        }
    }
    draw() {
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.translate(this.ctxOrigin.x, this.ctxOrigin.y);
        this.ctx.scale(this.ctxScale, this.ctxScale);
        for(let fig of this.sketch.rootFigures) {
            for(let child of fig.getRelatedFigures()) {
                this.drawFigure(child);
            }
        }
    }
    drawPoint(point: Point, size: number = 3, color: string = "black") {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        this.ctx.fill();
    }
}