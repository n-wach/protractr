import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "../gcs/figures";
import {Sketch} from "../gcs/sketch";
import {Tool} from "./tools";

export class SketchView {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    sketch: Sketch;
    subscribedTool: Tool;
    hoveredFigure: Figure;
    constructor(sketch: Sketch, canvas: HTMLCanvasElement) {
        this.sketch = sketch;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        let eventHandler = this.handleEvent.bind(this);
        let events = ["touchdown", "touchup", "touchmove", "mousemove", "mousedown", "mouseup"];
        for(let event of events) {
            this.canvas.addEventListener(event, eventHandler);
        }
    }
    handleEvent(event) {
        let point = new Point(event.offsetX, event.offsetY);
        let snapPoint = this.snapPoint(point);
        switch (event.type) {
            case "mousedown":
            case "touchdown":
                if(this.subscribedTool) this.subscribedTool.down(snapPoint);
                break;
            case "mousemove":
            case "touchmove":
                if(this.subscribedTool) this.subscribedTool.move(snapPoint);
                break;
            case "touchup":
            case "mouseup":
                if(this.subscribedTool) this.subscribedTool.up(snapPoint);
                break;
        }
        this.draw();
        this.updateHover(point);
    }

    updateHover(point) {
        let closest = this.sketch.getClosestFigure(point);
        if(closest != null && closest.getClosestPoint(point).distTo(point) > 10) {
            closest = null;
        }
        if(this.hoveredFigure != closest) {
            this.hoveredFigure = closest;
            return true;
        }
        return false;
    }

    subscribeTool(tool: Tool) {
        this.subscribedTool = tool;
    }

    draw() {
        console.log(this.sketch.figures);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for(let fig of this.sketch.figures) {
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 2;
            let pointSize = 3;
            if(this.hoveredFigure == fig) {
                pointSize = 5;
                this.ctx.lineWidth = 5;
            }
            switch(fig.type) {
                case "line":
                    let line = (fig as LineFigure);
                    this.ctx.beginPath();
                    this.ctx.moveTo(line.p1.x, line.p1.y);
                    this.ctx.lineTo(line.p2.x, line.p2.y);
                    this.ctx.stroke();
                    this.drawPoint(line.p1, pointSize);
                    this.drawPoint(line.p2, pointSize);
                    break;
                case "point":
                    let point = (fig as PointFigure);
                    this.drawPoint(point.p, pointSize);
                    break;
                case "circle":
                    let circle = (fig as CircleFigure);
                    this.ctx.beginPath();
                    this.ctx.arc(circle.c.x, circle.c.y, circle.r, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.drawPoint(circle.c, pointSize);
                    break;
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
        if (this.hoveredFigure && this.hoveredFigure != this.subscribedTool.currentFigure) return this.hoveredFigure.getClosestPoint(point);
        return point;
    }
}