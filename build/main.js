"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tools_1 = require("./ui/tools");
var figures_1 = require("./gcs/figures");
var canvas;
var tools;
var sidePane;
var adjustCanvasResolution = function (event) {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
};
window.addEventListener("resize", adjustCanvasResolution);
window.addEventListener("load", function () {
    canvas = document.getElementById("canvas");
    exports.ctx = canvas.getContext("2d");
    sidePane = document.getElementById("side-pane");
    tools = document.getElementById("tools");
    exports.protractr = new Protractr(exports.ctx, sidePane, tools);
    adjustCanvasResolution(null);
});
function getRelativeCoords(event) {
    return new figures_1.Point(event.offsetX, event.offsetY);
}
var Protractr = /** @class */ (function () {
    function Protractr(ctx, sidePane, toolbar) {
        this.toolList = [];
        this.figures = [];
        this.activeTool = null;
        console.debug(this);
        this.ctx = ctx;
        this.tools = tools;
        this.sidePane = sidePane;
        this.registerTool(new tools_1.PointTool());
        this.registerTool(new tools_1.LineTool());
        this.registerTool(new tools_1.CircleTool());
        this.registerTool(new tools_1.Tool("Arc", "Create an arc"));
        this.ctx.canvas.addEventListener("touchdown", this.canvasDown.bind(this));
        this.ctx.canvas.addEventListener("mousedown", this.canvasDown.bind(this));
        this.ctx.canvas.addEventListener("touchup", this.canvasUp.bind(this));
        this.ctx.canvas.addEventListener("mouseup", this.canvasUp.bind(this));
        this.ctx.canvas.addEventListener("touchmove", this.canvasMove.bind(this));
        this.ctx.canvas.addEventListener("mousemove", this.canvasMove.bind(this));
    }
    Protractr.prototype.canvasDown = function (event) {
        var point = getRelativeCoords(event);
        if (this.activeTool) {
            this.activeTool.down(point);
        }
        this.draw();
    };
    Protractr.prototype.canvasUp = function (event) {
        var point = getRelativeCoords(event);
        if (this.activeTool) {
            this.activeTool.up(point);
        }
        this.draw();
    };
    Protractr.prototype.canvasMove = function (event) {
        var point = getRelativeCoords(event);
        if (this.activeTool) {
            this.activeTool.move(point);
        }
        this.draw();
    };
    Protractr.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var _i = 0, _a = this.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            fig.draw();
        }
    };
    Protractr.prototype.registerTool = function (tool) {
        this.toolList.push(tool);
        tool.li = document.createElement("li");
        tool.li.title = tool.tooltip;
        tool.li.classList.add("tool");
        tool.li.style.backgroundImage = "url(" + tool.imageUrl + ")";
        tool.li.addEventListener("click", this.activateTool.bind(this, tool));
        this.tools.appendChild(tool.li);
    };
    Protractr.prototype.activateTool = function (tool) {
        if (this.activeTool !== null) {
            this.activeTool.deactivate();
        }
        this.activeTool = tool;
        if (this.activeTool !== null) {
            this.activeTool.activate();
        }
    };
    return Protractr;
}());
exports.Protractr = Protractr;
//# sourceMappingURL=main.js.map