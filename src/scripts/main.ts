import {CircleTool, LineTool, PointTool, Tool} from "./ui/tools";
import {Figure, Point} from "./gcs/figures";

let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;
let tools: HTMLUListElement;
let sidePane: HTMLDivElement;
export let protractr: Protractr;

let adjustCanvasResolution = function(event) {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
};
window.addEventListener("resize", adjustCanvasResolution);

window.addEventListener("load", function() {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    ctx = canvas.getContext("2d");
    sidePane = document.getElementById("side-pane") as HTMLDivElement;
    tools = document.getElementById("tools") as HTMLUListElement;
    protractr = new Protractr(ctx, sidePane, tools);
    adjustCanvasResolution(null);
});

function getRelativeCoords(event) {
    return new Point(event.offsetX, event.offsetY);
}

export class Protractr {
    ctx: CanvasRenderingContext2D;
    tools: HTMLUListElement;
    sidePane: HTMLDivElement;
    toolList: Tool[] = [];
    figures: Figure[] = [];
    activeTool: Tool = null;
    constructor(ctx: CanvasRenderingContext2D, sidePane: HTMLDivElement, toolbar: HTMLUListElement) {
        console.debug(this);
        this.ctx = ctx;
        this.tools = tools;
        this.sidePane = sidePane;
        this.registerTool(new PointTool());
        this.registerTool(new LineTool());
        this.registerTool(new CircleTool());
        this.registerTool(new Tool("Arc", "Create an arc"));
        this.ctx.canvas.addEventListener("touchdown", this.canvasDown.bind(this));
        this.ctx.canvas.addEventListener("mousedown", this.canvasDown.bind(this));
        this.ctx.canvas.addEventListener("touchup", this.canvasUp.bind(this));
        this.ctx.canvas.addEventListener("mouseup", this.canvasUp.bind(this));
        this.ctx.canvas.addEventListener("touchmove", this.canvasMove.bind(this));
        this.ctx.canvas.addEventListener("mousemove", this.canvasMove.bind(this));
    }
    canvasDown(event) {
        let point = getRelativeCoords(event);
        if(this.activeTool) {
            this.activeTool.down(point);
        }
        this.draw();
    }
    canvasUp(event) {
        let point = getRelativeCoords(event);
        if(this.activeTool) {
            this.activeTool.up(point);
        }
        this.draw();
    }
    canvasMove(event) {
        let point = getRelativeCoords(event);
        if(this.activeTool) {
            this.activeTool.move(point);
        }
        this.draw();
    }
    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for(let fig of this.figures) {
            fig.draw();
        }
    }
    registerTool(tool: Tool) {
        this.toolList.push(tool);
        tool.li = document.createElement("li");
        tool.li.title = tool.tooltip;
        tool.li.classList.add("tool");
        tool.li.style.backgroundImage = "url(" + tool.imageUrl + ")";
        tool.li.addEventListener("click", this.activateTool.bind(this, tool));
        this.tools.appendChild(tool.li);
    }
    activateTool(tool) {
        if(this.activeTool !== null) {
            this.activeTool.deactivate();
        }
        this.activeTool = tool;
        if(this.activeTool !== null) {
            this.activeTool.activate();
        }
    }
}



