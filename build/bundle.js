(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("../main");
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.set = function (p) {
        this.x = p.x;
        this.y = p.y;
    };
    Point.prototype.copy = function () {
        return new Point(this.x, this.y);
    };
    Point.prototype.distTo = function (o) {
        var dx = o.x - this.x;
        var dy = o.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    return Point;
}());
exports.Point = Point;
var PointFigure = /** @class */ (function () {
    function PointFigure(p) {
        this.p = p;
    }
    PointFigure.prototype.draw = function () {
        main_1.ctx.fillStyle = this.selected ? "red" : "black";
        main_1.ctx.beginPath();
        main_1.ctx.arc(this.p.x, this.p.y, 3, 0, Math.PI * 2);
        main_1.ctx.fill();
        main_1.ctx.closePath();
    };
    return PointFigure;
}());
exports.PointFigure = PointFigure;
var LineFigure = /** @class */ (function () {
    function LineFigure(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
    LineFigure.prototype.draw = function () {
        main_1.ctx.strokeStyle = this.selected ? "red" : "black";
        main_1.ctx.beginPath();
        main_1.ctx.moveTo(this.p1.p.x, this.p1.p.y);
        main_1.ctx.lineTo(this.p2.p.x, this.p2.p.y);
        main_1.ctx.stroke();
        main_1.ctx.closePath();
        this.p1.draw();
        this.p2.draw();
    };
    return LineFigure;
}());
exports.LineFigure = LineFigure;
var CircleFigure = /** @class */ (function () {
    function CircleFigure(c, r) {
        this.c = c;
        this.r = r;
    }
    CircleFigure.prototype.draw = function () {
        main_1.ctx.strokeStyle = this.selected ? "red" : "black";
        main_1.ctx.beginPath();
        main_1.ctx.arc(this.c.p.x, this.c.p.y, this.r, 0, Math.PI * 2);
        main_1.ctx.stroke();
        main_1.ctx.closePath();
        this.c.draw();
    };
    return CircleFigure;
}());
exports.CircleFigure = CircleFigure;

},{"../main":2}],2:[function(require,module,exports){
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

},{"./gcs/figures":1,"./ui/tools":3}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var figures_1 = require("../gcs/figures");
var main_1 = require("../main");
var Tool = /** @class */ (function () {
    function Tool(name, tooltip) {
        this.name = name;
        this.tooltip = tooltip;
        this.imageUrl = "../image/" + name.toLowerCase() + ".png";
    }
    Tool.prototype.activate = function () {
        this.li.classList.add("tool-active");
    };
    Tool.prototype.deactivate = function () {
        this.li.classList.remove("tool-active");
    };
    Tool.prototype.down = function (point) {
    };
    Tool.prototype.up = function (point) {
    };
    Tool.prototype.move = function (point) {
    };
    return Tool;
}());
exports.Tool = Tool;
var PointTool = /** @class */ (function (_super) {
    __extends(PointTool, _super);
    function PointTool() {
        return _super.call(this, "Point", "Create a point") || this;
    }
    PointTool.prototype.down = function (point) {
        this.currentFigure = new figures_1.PointFigure(point);
        this.currentFigure.selected = true;
        main_1.protractr.figures.push(this.currentFigure);
    };
    PointTool.prototype.up = function (point) {
        if (this.currentFigure) {
            this.currentFigure.selected = false;
            this.currentFigure = null;
        }
    };
    PointTool.prototype.move = function (point) {
        if (this.currentFigure) {
            this.currentFigure.p.set(point);
        }
    };
    return PointTool;
}(Tool));
exports.PointTool = PointTool;
var LineTool = /** @class */ (function (_super) {
    __extends(LineTool, _super);
    function LineTool() {
        return _super.call(this, "Line", "Create a line") || this;
    }
    LineTool.prototype.down = function (point) {
        this.up(point);
        this.currentFigure = new figures_1.LineFigure(new figures_1.PointFigure(point), new figures_1.PointFigure(point.copy()));
        this.currentFigure.selected = true;
        this.currentFigure.p2.selected = true;
        main_1.protractr.figures.push(this.currentFigure);
    };
    LineTool.prototype.up = function (point) {
        if (this.currentFigure) {
            this.currentFigure.p2.selected = false;
            this.currentFigure.selected = false;
            this.currentFigure = null;
        }
    };
    LineTool.prototype.move = function (point) {
        if (this.currentFigure) {
            this.currentFigure.p2.p.set(point);
        }
    };
    return LineTool;
}(Tool));
exports.LineTool = LineTool;
var CircleTool = /** @class */ (function (_super) {
    __extends(CircleTool, _super);
    function CircleTool() {
        return _super.call(this, "Circle", "Create a circle") || this;
    }
    CircleTool.prototype.down = function (point) {
        this.up(point);
        this.currentFigure = new figures_1.CircleFigure(new figures_1.PointFigure(point), point.copy());
        this.currentFigure.selected = true;
        main_1.protractr.figures.push(this.currentFigure);
    };
    CircleTool.prototype.up = function (point) {
        if (this.currentFigure) {
            this.currentFigure.selected = false;
            this.currentFigure = null;
        }
    };
    CircleTool.prototype.move = function (point) {
        if (this.currentFigure) {
            this.currentFigure.r = point.distTo(this.currentFigure.c.p);
        }
    };
    return CircleTool;
}(Tool));
exports.CircleTool = CircleTool;

},{"../gcs/figures":1,"../main":2}]},{},[2]);
