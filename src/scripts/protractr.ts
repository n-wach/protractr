import {CircleTool, LineTool, PointTool, Tool} from "./ui/tools";
import {Figure, Point} from "./gcs/figures";
import {Toolbar} from "./ui/toolbar";
import {protractr} from "./main";

export class Protractr {
    ctx: CanvasRenderingContext2D;
    sidePane: HTMLDivElement;
    figures: Figure[] = [];
    toolbar: Toolbar;
    constructor(ctx: CanvasRenderingContext2D, sidePane: HTMLDivElement, toolbar: HTMLUListElement) {
        console.debug(this);
        this.ctx = ctx;
        this.toolbar = new Toolbar(this, toolbar);
        this.sidePane = sidePane;
        this.ctx.canvas.addEventListener("touchdown", this.canvasDown.bind(this));
        this.ctx.canvas.addEventListener("mousedown", this.canvasDown.bind(this));
        this.ctx.canvas.addEventListener("touchup", this.canvasUp.bind(this));
        this.ctx.canvas.addEventListener("mouseup", this.canvasUp.bind(this));
        this.ctx.canvas.addEventListener("touchmove", this.canvasMove.bind(this));
        this.ctx.canvas.addEventListener("mousemove", this.canvasMove.bind(this));
    }
    canvasDown(event) {
        let point = getRelativeCoords(event);
        if(this.toolbar.activeTool) {
            this.toolbar.activeTool.down(snapCoords(point));
        }
        this.draw();
    }
    canvasUp(event) {
        let point = getRelativeCoords(event);
        if(this.toolbar.activeTool) {
            this.toolbar.activeTool.up(snapCoords(point));
        }
        this.draw();
    }
    canvasMove(event) {
        let point = getRelativeCoords(event);
        if(this.toolbar.activeTool) {
            this.toolbar.activeTool.move(snapCoords(point));
        }
        this.draw();
    }
    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for(let fig of this.figures) {
            fig.draw();
        }
    }
    getAllSnappablePoints(): Point[] {
        let points: Point[] = [];

        for(let fig of this.figures) {
            if(fig.selected) continue;
            for(let p of fig.getSnappablePoints()) {
                points.push(p);
            }
        }

        return points;
    }
}


function snapCoords(point: Point) {
    let points = protractr.getAllSnappablePoints();
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

function getRelativeCoords(event) {
    return new Point(event.offsetX, event.offsetY);
}
