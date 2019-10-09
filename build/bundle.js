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
    PointFigure.prototype.getSnappablePoints = function () {
        return [this.p];
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
    LineFigure.prototype.getSnappablePoints = function () {
        return [this.p1.p, this.p2.p];
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
    CircleFigure.prototype.getSnappablePoints = function () {
        return [this.c.p];
    };
    return CircleFigure;
}());
exports.CircleFigure = CircleFigure;

},{"../main":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var protractr_1 = require("./protractr");
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
    exports.protractr = new protractr_1.Protractr(exports.ctx, sidePane, tools);
    adjustCanvasResolution(null);
});

},{"./protractr":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var figures_1 = require("./gcs/figures");
var toolbar_1 = require("./ui/toolbar");
var main_1 = require("./main");
var Protractr = /** @class */ (function () {
    function Protractr(ctx, sidePane, toolbar) {
        this.figures = [];
        console.debug(this);
        this.ctx = ctx;
        this.toolbar = new toolbar_1.Toolbar(this, toolbar);
        this.sidePane = sidePane;
        this.ctx.canvas.addEventListener("touchdown", this.canvasDown.bind(this));
        this.ctx.canvas.addEventListener("mousedown", this.canvasDown.bind(this));
        this.ctx.canvas.addEventListener("touchup", this.canvasUp.bind(this));
        this.ctx.canvas.addEventListener("mouseup", this.canvasUp.bind(this));
        this.ctx.canvas.addEventListener("touchmove", this.canvasMove.bind(this));
        this.ctx.canvas.addEventListener("mousemove", this.canvasMove.bind(this));
    }
    Protractr.prototype.canvasDown = function (event) {
        var point = getRelativeCoords(event);
        if (this.toolbar.activeTool) {
            this.toolbar.activeTool.down(snapCoords(point));
        }
        this.draw();
    };
    Protractr.prototype.canvasUp = function (event) {
        var point = getRelativeCoords(event);
        if (this.toolbar.activeTool) {
            this.toolbar.activeTool.up(snapCoords(point));
        }
        this.draw();
    };
    Protractr.prototype.canvasMove = function (event) {
        var point = getRelativeCoords(event);
        if (this.toolbar.activeTool) {
            this.toolbar.activeTool.move(snapCoords(point));
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
    Protractr.prototype.getAllSnappablePoints = function () {
        var points = [];
        for (var _i = 0, _a = this.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            if (fig.selected)
                continue;
            for (var _b = 0, _c = fig.getSnappablePoints(); _b < _c.length; _b++) {
                var p = _c[_b];
                points.push(p);
            }
        }
        return points;
    };
    return Protractr;
}());
exports.Protractr = Protractr;
function snapCoords(point) {
    var points = main_1.protractr.getAllSnappablePoints();
    var closest = point;
    var closestDist = 10;
    for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
        var p = points_1[_i];
        var d = p.distTo(point);
        if (d < closestDist) {
            closest = p;
            closestDist = d;
        }
    }
    return closest.copy();
}
function getRelativeCoords(event) {
    return new figures_1.Point(event.offsetX, event.offsetY);
}

},{"./gcs/figures":1,"./main":2,"./ui/toolbar":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tools_1 = require("./tools");
var Toolbar = /** @class */ (function () {
    function Toolbar(protractr, toolbarElement) {
        this.protractr = protractr;
        this.toolbarElement = toolbarElement;
        this.toolElements = [];
        this.initializeTools();
    }
    Toolbar.prototype.initializeTools = function () {
        this.addTool(new tools_1.PointTool(), "point.png");
        this.addTool(new tools_1.LineTool(), "line.png");
        this.addTool(new tools_1.CircleTool(), "circle.png");
        this.addTool(new tools_1.Tool("Arc", "Create an arc"), "arc.png");
        this.addTool(new tools_1.UndoTool(), "undo.png");
        this.addTool(new tools_1.RedoTool(), "redo.png");
    };
    Toolbar.prototype.addTool = function (tool, image) {
        var e = new ToolElement(tool, image);
        e.tool.toolbar = this;
        this.toolElements.push(e);
        this.toolbarElement.appendChild(e.li);
    };
    Toolbar.prototype.setActive = function (tool) {
        this.activeTool = tool;
        for (var _i = 0, _a = this.toolElements; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.tool == tool) {
                e.activate();
            }
            else {
                e.deactivate();
            }
        }
    };
    return Toolbar;
}());
exports.Toolbar = Toolbar;
var ToolElement = /** @class */ (function () {
    function ToolElement(tool, image) {
        this.tool = tool;
        this.li = document.createElement("li");
        this.li.title = tool.tooltip;
        this.li.classList.add("tool");
        this.li.style.backgroundImage = "url('../image/" + image + "')";
        this.li.addEventListener("click", this.tool.used.bind(tool));
    }
    ToolElement.prototype.activate = function () {
        this.li.classList.add("tool-active");
    };
    ToolElement.prototype.deactivate = function () {
        this.li.classList.remove("tool-active");
    };
    return ToolElement;
}());

},{"./tools":5}],5:[function(require,module,exports){
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
    }
    Tool.prototype.used = function () {
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
var UndoTool = /** @class */ (function (_super) {
    __extends(UndoTool, _super);
    function UndoTool() {
        return _super.call(this, "Undo", "Undo the most recent action") || this;
    }
    UndoTool.prototype.used = function () {
        alert("Undo");
    };
    return UndoTool;
}(Tool));
exports.UndoTool = UndoTool;
var RedoTool = /** @class */ (function (_super) {
    __extends(RedoTool, _super);
    function RedoTool() {
        return _super.call(this, "Redo", "Redo the most recent undo") || this;
    }
    RedoTool.prototype.used = function () {
        alert("Redo");
    };
    return RedoTool;
}(Tool));
exports.RedoTool = RedoTool;
var ActivatableTool = /** @class */ (function (_super) {
    __extends(ActivatableTool, _super);
    function ActivatableTool() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActivatableTool.prototype.used = function () {
        this.toolbar.setActive(this);
    };
    return ActivatableTool;
}(Tool));
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
}(ActivatableTool));
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
}(ActivatableTool));
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
}(ActivatableTool));
exports.CircleTool = CircleTool;

},{"../gcs/figures":1,"../main":2}]},{},[2]);
