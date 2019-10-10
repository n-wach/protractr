import {Point} from "../gcs/figures";
import {Sketch} from "../gcs/sketch";
import {Tool} from "./tools";

function eventToRelative(event) {
    return new Point(event.offsetX, event.offsetY);
}

export class SketchView {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    sketch: Sketch;
    subscribedTool: Tool;
    constructor(sketch: Sketch, canvas: HTMLCanvasElement) {
        this.sketch = sketch;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        let eventHandler = this.handleEvent.bind(this);
        this.canvas.addEventListener("touchdown", eventHandler);
        this.canvas.addEventListener("touchup", eventHandler);
        this.canvas.addEventListener("touchmove", eventHandler);
        this.canvas.addEventListener("mousedown", eventHandler);
        this.canvas.addEventListener("mouseup", eventHandler);
        this.canvas.addEventListener("mousemove", eventHandler);
    }
    handleEvent(event) {
        if(!this.subscribedTool) return;
        let point = eventToRelative(event);
        let snapPoint = this.snapPoint(point);
        switch (event.type) {
            case "mousedown":
            case "touchdown":
                this.subscribedTool.down(snapPoint);
                break;
            case "mousemove":
            case "touchmove":
                this.subscribedTool.move(snapPoint);
                break;
            case "touchup":
            case "mouseup":
                this.subscribedTool.up(snapPoint);
                break;
        }
        this.draw();
    }

    subscribeTool(tool: Tool) {
        this.subscribedTool = tool;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for(let fig of this.sketch.figures) {
            fig.draw(this.ctx);
        }
    }

    snapPoint(point: Point): Point{
        let points: Point[] = [];

        for(let fig of this.sketch.figures) {
            if(fig.selected) continue;
            for(let p of fig.getSnappablePoints()) {
                points.push(p);
            }
        }

        let closest = point;
        let closestDist = 10;
        for(let p of points) {
            let d = p.distTo(point);
            if(d < closestDist) {
                closest = p;
                closestDist = d;
            }
        }

        return closest.copy();
    }
}