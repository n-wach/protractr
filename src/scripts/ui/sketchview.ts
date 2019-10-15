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

    constructor(ui: UI, sketch: Sketch, canvas: HTMLCanvasElement) {
        this.ui = ui;
        this.sketch = sketch;
        this.canvas = canvas;
        this.selectedFigures = [];
        this.ctxScale = 1;
        this.ctxOrigin = new Point(0, 0);
        this.updateSelected();
        this.ctx = this.canvas.getContext("2d");
        let eventHandler = this.handleEvent.bind(this);
        let events = ["touchdown", "touchup", "touchmove", "mousemove", "mousedown", "mouseup", "wheel"];
        for(let event of events) {
            this.canvas.addEventListener(event, eventHandler);
        }
    }
    handleEvent(event) {
        event.preventDefault();
        let offset = new Point(event.offsetX, event.offsetY);
        let scaled = new Point(offset.x / this.ctxScale, offset.y / this.ctxScale);
        let point = new Point(scaled.x - this.ctxOrigin.x / this.ctxScale, scaled.y - this.ctxOrigin.y / this.ctxScale);
        let snapPoint = this.snapPoint(point);
        switch (event.type) {
            case "mousedown":
            case "touchdown":
                switch(event.which) {
                    case 1:
                        if(this.subscribedTool) {
                            this.subscribedTool.down(snapPoint);
                        } else {
                            if(this.hoveredFigure) {
                                this.dragging = false;
                                this.draggedFigure = this.hoveredFigure;
                                this.lastFigureDrag = point.copy();
                            }
                        }
                        break;
                    case 2:
                        this.lastDrag = offset.copy();
                }
                break;
            case "wheel":
                let originalScale = this.ctxScale;
                this.ctxScale = this.ctxScale - (event.deltaY * 0.05 * this.ctxScale);
                let scaleChange = originalScale - this.ctxScale;
                this.ctxOrigin.x += (point.x * scaleChange);
                this.ctxOrigin.y += (point.y * scaleChange);
                break;
            case "mousemove":
            case "touchmove":
                if(this.subscribedTool) {
                    this.subscribedTool.move(snapPoint);
                } else {
                    if (this.draggedFigure != null) {
                        this.dragging = true;
                        this.draggedFigure.translate(this.lastFigureDrag, point.copy());
                        this.lastFigureDrag = point.copy();
                    }
                }

                if(this.lastDrag != null) {
                    this.ctxOrigin.x += offset.x - this.lastDrag.x;
                    this.ctxOrigin.y += offset.y - this.lastDrag.y;
                    this.lastDrag = offset.copy();
                }
                break;
            case "touchup":
            case "mouseup":
                switch(event.which) {
                    case 1:
                        if (this.subscribedTool) {
                            this.subscribedTool.up(snapPoint);
                        } else {
                            if(this.draggedFigure === null || this.dragging === false) {
                                if (this.hoveredFigure) {
                                    this.toggleSelected(this.hoveredFigure);
                                } else {
                                    this.selectedFigures = [];
                                    this.updateSelected();
                                }
                            }
                            this.draggedFigure = null;
                            this.dragging = false;
                        }
                        break;
                    case 2:
                        this.lastDrag = null;
                        break;

                }
                break;
        }
        this.draw();
        this.updateHover(point);
    }

    updateHover(point) {
        let closest;
        if (this.subscribedTool != null && this.subscribedTool.currentFigure) {
            let ignoredFigures = [this.subscribedTool.currentFigure];
            for(let child of this.subscribedTool.currentFigure.childFigures) {
                ignoredFigures.push(child);
            }
            closest = this.sketch.getClosestFigure(point, ignoredFigures);
        } else {
            closest = this.sketch.getClosestFigure(point);
        }
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
                this.ctx.arc(circle.c.x, circle.c.y, circle.r, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
        }
    }

    draw() {
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.translate(this.ctxOrigin.x, this.ctxOrigin.y);
        this.ctx.scale(this.ctxScale, this.ctxScale);
        console.log(this.ctxScale);
        for(let fig of this.sketch.figures) {
            this.drawFigure(fig);
            for(let child of fig.childFigures) {
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
}