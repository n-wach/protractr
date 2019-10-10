(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    PointFigure.prototype.draw = function (ctx) {
        ctx.fillStyle = this.selected ? "red" : "black";
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
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
    LineFigure.prototype.draw = function (ctx) {
        ctx.strokeStyle = this.selected ? "red" : "black";
        ctx.beginPath();
        ctx.moveTo(this.p1.p.x, this.p1.p.y);
        ctx.lineTo(this.p2.p.x, this.p2.p.y);
        ctx.stroke();
        ctx.closePath();
        this.p1.draw(ctx);
        this.p2.draw(ctx);
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
    CircleFigure.prototype.draw = function (ctx) {
        ctx.strokeStyle = this.selected ? "red" : "black";
        ctx.beginPath();
        ctx.arc(this.c.p.x, this.c.p.y, this.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        this.c.draw(ctx);
    };
    CircleFigure.prototype.getSnappablePoints = function () {
        return [this.c.p];
    };
    return CircleFigure;
}());
exports.CircleFigure = CircleFigure;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var solver_1 = require("./solver");
var Sketch = /** @class */ (function () {
    function Sketch() {
        this.constraints = [];
        this.variables = [];
        this.figures = [];
        this.solver = new solver_1.Solver();
    }
    return Sketch;
}());
exports.Sketch = Sketch;

},{"./solver":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Solver = /** @class */ (function () {
    function Solver() {
    }
    return Solver;
}());
exports.Solver = Solver;

},{}],4:[function(require,module,exports){
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
    sidePane = document.getElementById("side-pane");
    tools = document.getElementById("tools");
    adjustCanvasResolution(null);
    exports.protractr = new protractr_1.Protractr(canvas, sidePane, tools);
    console.log("Protractr: ", exports.protractr);
});

},{"./protractr":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sketch_1 = require("./gcs/sketch");
var ui_1 = require("./ui/ui");
var Protractr = /** @class */ (function () {
    function Protractr(canvas, sidePane, toolbar) {
        this.sketch = new sketch_1.Sketch();
        this.ui = new ui_1.UI(this, canvas, sidePane, toolbar);
    }
    return Protractr;
}());
exports.Protractr = Protractr;

},{"./gcs/sketch":2,"./ui/ui":10}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InfoPane = /** @class */ (function () {
    function InfoPane(sidePane) {
    }
    return InfoPane;
}());
exports.InfoPane = InfoPane;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var figures_1 = require("../gcs/figures");
function eventToRelative(event) {
    return new figures_1.Point(event.offsetX, event.offsetY);
}
var SketchView = /** @class */ (function () {
    function SketchView(sketch, canvas) {
        this.sketch = sketch;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        var eventHandler = this.handleEvent.bind(this);
        this.canvas.addEventListener("touchdown", eventHandler);
        this.canvas.addEventListener("touchup", eventHandler);
        this.canvas.addEventListener("touchmove", eventHandler);
        this.canvas.addEventListener("mousedown", eventHandler);
        this.canvas.addEventListener("mouseup", eventHandler);
        this.canvas.addEventListener("mousemove", eventHandler);
    }
    SketchView.prototype.handleEvent = function (event) {
        if (!this.subscribedTool)
            return;
        var point = eventToRelative(event);
        var snapPoint = this.snapPoint(point);
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
    };
    SketchView.prototype.subscribeTool = function (tool) {
        this.subscribedTool = tool;
    };
    SketchView.prototype.draw = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var _i = 0, _a = this.sketch.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            fig.draw(this.ctx);
        }
    };
    SketchView.prototype.snapPoint = function (point) {
        var points = [];
        for (var _i = 0, _a = this.sketch.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            if (fig.selected)
                continue;
            for (var _b = 0, _c = fig.getSnappablePoints(); _b < _c.length; _b++) {
                var p = _c[_b];
                points.push(p);
            }
        }
        var closest = point;
        var closestDist = 10;
        for (var _d = 0, points_1 = points; _d < points_1.length; _d++) {
            var p = points_1[_d];
            var d = p.distTo(point);
            if (d < closestDist) {
                closest = p;
                closestDist = d;
            }
        }
        return closest.copy();
    };
    return SketchView;
}());
exports.SketchView = SketchView;

},{"../gcs/figures":1}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tools_1 = require("./tools");
var Toolbar = /** @class */ (function () {
    function Toolbar(toolbarElement, sketchView) {
        this.sketchView = sketchView;
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
        this.sketchView.subscribeTool(tool);
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

},{"./tools":9}],9:[function(require,module,exports){
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
var FigureTool = /** @class */ (function (_super) {
    __extends(FigureTool, _super);
    function FigureTool() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FigureTool.prototype.used = function () {
        _super.prototype.used.call(this);
    };
    return FigureTool;
}(ActivatableTool));
exports.FigureTool = FigureTool;
var PointTool = /** @class */ (function (_super) {
    __extends(PointTool, _super);
    function PointTool() {
        return _super.call(this, "Point", "Create a point") || this;
    }
    PointTool.prototype.down = function (point) {
        this.currentFigure = new figures_1.PointFigure(point);
        this.currentFigure.selected = true;
        main_1.protractr.sketch.figures.push(this.currentFigure);
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
}(FigureTool));
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
        main_1.protractr.sketch.figures.push(this.currentFigure);
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
}(FigureTool));
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
        main_1.protractr.sketch.figures.push(this.currentFigure);
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
}(FigureTool));
exports.CircleTool = CircleTool;

},{"../gcs/figures":1,"../main":4}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toolbar_1 = require("./toolbar");
var infopane_1 = require("./infopane");
var sketchview_1 = require("./sketchview");
var UI = /** @class */ (function () {
    function UI(protractr, canvas, sidePane, toolbar) {
        this.protractr = protractr;
        this.sketchView = new sketchview_1.SketchView(this.protractr.sketch, canvas);
        this.toolbar = new toolbar_1.Toolbar(toolbar, this.sketchView);
        this.infoPane = new infopane_1.InfoPane(sidePane);
    }
    return UI;
}());
exports.UI = UI;

},{"./infopane":6,"./sketchview":7,"./toolbar":8}]},{},[4]);
