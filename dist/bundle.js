(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Variable = /** @class */ (function () {
    function Variable() {
    }
    return Variable;
}());
exports.Variable = Variable;
var ConstraintPossibility = /** @class */ (function () {
    function ConstraintPossibility(requiredTypes, possibleConstraint) {
        this.requiredTypes = requiredTypes;
        this.possibleConstraint = possibleConstraint;
    }
    ConstraintPossibility.prototype.satisfiesTypes = function (s) {
        console.log(s, this.requiredTypes);
        return s.sort().join("") == this.requiredTypes.sort().join("");
    };
    return ConstraintPossibility;
}());
var possibleConstraints = [
    new ConstraintPossibility(["point", "point"], "coincident"),
    new ConstraintPossibility(["point"], "lock"),
    new ConstraintPossibility(["line", "point"], "coincident"),
    new ConstraintPossibility(["line", "point"], "midpoint"),
    new ConstraintPossibility(["line"], "horizontal"),
    new ConstraintPossibility(["line"], "vertical"),
    new ConstraintPossibility(["line"], "lock"),
    new ConstraintPossibility(["line", "line"], "perpendicular"),
    new ConstraintPossibility(["line", "line"], "parallel"),
    new ConstraintPossibility(["line", "circle"], "tangent"),
    new ConstraintPossibility(["line", "circle"], "coincident"),
    new ConstraintPossibility(["line", "circle"], "equal"),
    new ConstraintPossibility(["circle"], "lock"),
    new ConstraintPossibility(["circle", "circle"], "equal"),
    new ConstraintPossibility(["circle", "circle"], "concentric"),
    new ConstraintPossibility(["circle", "point"], "center"),
    new ConstraintPossibility(["circle", "point"], "tangent"),
];
function getPossibleConstraints(figs) {
    var shapes = [];
    for (var _i = 0, figs_1 = figs; _i < figs_1.length; _i++) {
        var fig = figs_1[_i];
        shapes.push(fig.type);
    }
    var possibilities = [];
    for (var _a = 0, possibleConstraints_1 = possibleConstraints; _a < possibleConstraints_1.length; _a++) {
        var pc = possibleConstraints_1[_a];
        if (pc.satisfiesTypes(shapes))
            possibilities.push(pc.possibleConstraint);
    }
    return possibilities;
}
exports.getPossibleConstraints = getPossibleConstraints;

},{}],2:[function(require,module,exports){
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
        return Math.sqrt(this.distTo2(o));
    };
    Point.prototype.distTo2 = function (o) {
        var dx = o.x - this.x;
        var dy = o.y - this.y;
        return dx * dx + dy * dy;
    };
    Point.prototype.normalizeSelf = function () {
        var length = this.distTo(ORIGIN);
        this.x /= length;
        this.y /= length;
    };
    Point.prototype.pointTowards = function (target, dist) {
        var diff = new Point(target.x - this.x, target.y - this.y);
        diff.normalizeSelf();
        return new Point(this.x + diff.x * dist, this.y + diff.y * dist);
    };
    Point.prototype.equals = function (o) {
        return o.x == this.x && o.y == this.y;
    };
    return Point;
}());
exports.Point = Point;
var ORIGIN = new Point(0, 0);
var PointFigure = /** @class */ (function () {
    function PointFigure(p) {
        this.type = "point";
        this.p = p;
    }
    PointFigure.prototype.getClosestPoint = function (point) {
        return this.p.copy();
    };
    return PointFigure;
}());
exports.PointFigure = PointFigure;
var LineFigure = /** @class */ (function () {
    function LineFigure(p1, p2) {
        this.type = "line";
        this.p1 = p1;
        this.p2 = p2;
    }
    LineFigure.prototype.projectionFactor = function (point) {
        if (this.p1.equals(point))
            return 0;
        if (this.p2.equals(point))
            return 1;
        var dx = this.p1.x - this.p2.x;
        var dy = this.p1.y - this.p2.y;
        var len2 = dx * dx + dy * dy;
        return -((point.x - this.p1.x) * dx + (point.y - this.p1.y) * dy) / len2;
    };
    LineFigure.prototype.segmentFraction = function (point) {
        var segFrac = this.projectionFactor(point);
        if (segFrac < 0)
            return 0;
        if (segFrac > 1 || isNaN(segFrac))
            return 1;
        return segFrac;
    };
    LineFigure.prototype.project = function (point) {
        var r = this.segmentFraction(point);
        var px = this.p1.x + r * (this.p2.x - this.p1.x);
        var py = this.p1.y + r * (this.p2.y - this.p1.y);
        return new Point(px, py);
    };
    LineFigure.prototype.getClosestPoint = function (point) {
        return this.project(point);
    };
    return LineFigure;
}());
exports.LineFigure = LineFigure;
var CircleFigure = /** @class */ (function () {
    function CircleFigure(c, r) {
        this.type = "circle";
        this.c = c;
        this.r = r;
    }
    CircleFigure.prototype.getClosestPoint = function (point) {
        var dist = point.distTo(this.c);
        var radDist = Math.abs(dist - this.r);
        if (dist < radDist) {
            return this.c.copy();
        }
        else {
            return this.c.pointTowards(point, this.r);
        }
    };
    return CircleFigure;
}());
exports.CircleFigure = CircleFigure;

},{}],3:[function(require,module,exports){
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
    Sketch.prototype.getClosestFigure = function (point, ignoreFigures) {
        if (ignoreFigures === void 0) { ignoreFigures = []; }
        if (this.figures.length == 0)
            return null;
        var dist = this.figures[0].getClosestPoint(point).distTo(point);
        var closest = this.figures[0];
        for (var _i = 0, _a = this.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            if (ignoreFigures.indexOf(fig) != -1)
                continue;
            var p = fig.getClosestPoint(point);
            //protractr.ui.sketchView.drawPoint(p, 3, "blue");
            var d = p.distTo(point);
            if (d < dist) {
                closest = fig;
                dist = d;
            }
        }
        return closest;
    };
    return Sketch;
}());
exports.Sketch = Sketch;

},{"./solver":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Solver = /** @class */ (function () {
    function Solver() {
    }
    return Solver;
}());
exports.Solver = Solver;

},{}],5:[function(require,module,exports){
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

},{"./protractr":6}],6:[function(require,module,exports){
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

},{"./gcs/sketch":3,"./ui/ui":11}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constraint_1 = require("../gcs/constraint");
var InfoPane = /** @class */ (function () {
    function InfoPane(sidePane) {
        this.sidePane = sidePane;
        this.title = document.createElement("p");
        this.sidePane.appendChild(this.title);
        var d = document.createElement("p");
        d.innerText = "Possible Constraints:";
        this.sidePane.appendChild(d);
        this.possibleConstraints = document.createElement("ul");
        this.sidePane.appendChild(this.possibleConstraints);
    }
    InfoPane.prototype.setFocusedFigures = function (figures) {
        if (figures === null || figures.length == 0) {
            this.title.innerText = "Nothing selected";
        }
        else if (figures.length == 1) {
            this.title.innerText = "Selected " + figures[0].type;
        }
        else {
            this.title.innerText = "Multiple things selected";
        }
        while (this.possibleConstraints.lastChild) {
            this.possibleConstraints.removeChild(this.possibleConstraints.lastChild);
        }
        for (var _i = 0, _a = constraint_1.getPossibleConstraints(figures); _i < _a.length; _i++) {
            var pc = _a[_i];
            var child = document.createElement("li");
            child.innerText = pc;
            this.possibleConstraints.appendChild(child);
        }
    };
    return InfoPane;
}());
exports.InfoPane = InfoPane;

},{"../gcs/constraint":1}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var figures_1 = require("../gcs/figures");
var SketchView = /** @class */ (function () {
    function SketchView(ui, sketch, canvas) {
        this.ui = ui;
        this.sketch = sketch;
        this.canvas = canvas;
        this.selectedFigures = [];
        this.ctxScale = 1;
        this.ctxOrigin = new figures_1.Point(0, 0);
        this.updateSelected();
        this.ctx = this.canvas.getContext("2d");
        var eventHandler = this.handleEvent.bind(this);
        var events = ["touchdown", "touchup", "touchmove", "mousemove", "mousedown", "mouseup", "wheel"];
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var event_1 = events_1[_i];
            this.canvas.addEventListener(event_1, eventHandler);
        }
    }
    SketchView.prototype.handleEvent = function (event) {
        event.preventDefault();
        var offset = new figures_1.Point(event.offsetX, event.offsetY);
        var scaled = new figures_1.Point(offset.x / this.ctxScale, offset.y / this.ctxScale);
        var point = new figures_1.Point(scaled.x - this.ctxOrigin.x, scaled.y - this.ctxOrigin.y);
        console.log(point);
        var snapPoint = this.snapPoint(point);
        switch (event.type) {
            case "mousedown":
            case "touchdown":
                switch (event.which) {
                    case 1:
                        if (this.subscribedTool) {
                            this.subscribedTool.down(snapPoint);
                        }
                        else {
                            if (this.hoveredFigure) {
                                this.toggleSelected(this.hoveredFigure);
                            }
                            else {
                                this.selectedFigures = [];
                                this.updateSelected();
                            }
                        }
                        break;
                    case 2:
                        this.lastDrag = offset.copy();
                }
                break;
            case "wheel":
                var originalScale = this.ctxScale;
                this.ctxScale = Math.min(10, Math.max(0.1, this.ctxScale - (event.deltaY * 0.01 * this.ctxScale)));
                var scaleChange = originalScale - this.ctxScale;
                this.ctxOrigin.x += (scaled.x * scaleChange);
                this.ctxOrigin.y += (scaled.y * scaleChange);
                break;
            case "mousemove":
            case "touchmove":
                if (this.subscribedTool)
                    this.subscribedTool.move(snapPoint);
                if (this.lastDrag != null) {
                    console.log("This", offset);
                    console.log("Last", this.lastDrag);
                    this.ctxOrigin.x += (offset.x - this.lastDrag.x) / this.ctxScale;
                    this.ctxOrigin.y += (offset.y - this.lastDrag.y) / this.ctxScale;
                    this.lastDrag = offset.copy();
                    console.log("Origin", this.ctxOrigin);
                }
                break;
            case "touchup":
            case "mouseup":
                switch (event.which) {
                    case 1:
                        if (this.subscribedTool)
                            this.subscribedTool.up(snapPoint);
                        break;
                    case 2:
                        this.lastDrag = null;
                        break;
                }
                break;
        }
        this.draw();
        this.updateHover(point);
    };
    SketchView.prototype.updateHover = function (point) {
        var closest;
        if (this.subscribedTool != null) {
            closest = this.sketch.getClosestFigure(point, [this.subscribedTool.currentFigure]);
        }
        else {
            closest = this.sketch.getClosestFigure(point);
        }
        if (closest != null && closest.getClosestPoint(point).distTo(point) > 10 / this.ctxScale) {
            closest = null;
        }
        if (this.hoveredFigure != closest) {
            this.hoveredFigure = closest;
        }
        if (this.hoveredFigure != null) {
            this.setCursor("move");
        }
        else {
            this.setCursor("default");
        }
    };
    SketchView.prototype.subscribeTool = function (tool) {
        this.subscribedTool = tool;
    };
    SketchView.prototype.drawFigure = function (fig) {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2 / this.ctxScale;
        var pointSize = 3 / this.ctxScale;
        if (this.hoveredFigure == fig) {
            pointSize = 5 / this.ctxScale;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        if (this.selectedFigures.indexOf(fig) != -1) {
            this.ctx.strokeStyle = "#5e9cff";
        }
        switch (fig.type) {
            case "line":
                var line = fig;
                this.ctx.beginPath();
                this.ctx.moveTo(line.p1.x, line.p1.y);
                this.ctx.lineTo(line.p2.x, line.p2.y);
                this.ctx.stroke();
                this.drawPoint(line.p1, pointSize, this.ctx.strokeStyle);
                this.drawPoint(line.p2, pointSize, this.ctx.strokeStyle);
                break;
            case "point":
                var point = fig;
                this.drawPoint(point.p, pointSize, this.ctx.strokeStyle);
                break;
            case "circle":
                var circle = fig;
                this.ctx.beginPath();
                this.ctx.arc(circle.c.x, circle.c.y, circle.r, 0, Math.PI * 2);
                this.ctx.stroke();
                this.drawPoint(circle.c, pointSize, this.ctx.strokeStyle);
                break;
        }
    };
    SketchView.prototype.draw = function () {
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.scale(this.ctxScale, this.ctxScale);
        this.ctx.translate(this.ctxOrigin.x, this.ctxOrigin.y);
        console.log(this.ctxScale);
        for (var _i = 0, _a = this.sketch.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            this.drawFigure(fig);
        }
    };
    SketchView.prototype.drawPoint = function (point, size, color) {
        if (size === void 0) { size = 3; }
        if (color === void 0) { color = "black"; }
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        this.ctx.fill();
    };
    SketchView.prototype.snapPoint = function (point) {
        if (this.hoveredFigure && this.subscribedTool && this.hoveredFigure != this.subscribedTool.currentFigure)
            return this.hoveredFigure.getClosestPoint(point);
        return point;
    };
    SketchView.prototype.toggleSelected = function (fig) {
        if (this.selectedFigures.indexOf(fig) == -1) {
            this.selectedFigures.push(fig);
        }
        else {
            this.selectedFigures = this.selectedFigures.filter(function (value, index, arr) {
                return value != fig;
            });
        }
        this.updateSelected();
    };
    SketchView.prototype.updateSelected = function () {
        this.ui.infoPane.setFocusedFigures(this.selectedFigures);
    };
    SketchView.prototype.setCursor = function (cursor) {
        this.canvas.style.cursor = cursor;
    };
    return SketchView;
}());
exports.SketchView = SketchView;

},{"../gcs/figures":2}],9:[function(require,module,exports){
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

},{"./tools":10}],10:[function(require,module,exports){
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
        return false;
    };
    Tool.prototype.up = function (point) {
        return false;
    };
    Tool.prototype.move = function (point) {
        return false;
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
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.active = false;
        return _this;
    }
    ActivatableTool.prototype.used = function () {
        if (this.active) {
            this.toolbar.setActive(null);
            this.active = false;
        }
        else {
            this.toolbar.setActive(this);
            this.active = true;
        }
    };
    return ActivatableTool;
}(Tool));
var SelectionTool = /** @class */ (function (_super) {
    __extends(SelectionTool, _super);
    function SelectionTool() {
        return _super.call(this, "Select", "Select stuff") || this;
    }
    SelectionTool.prototype.move = function (point) {
        return false;
    };
    SelectionTool.prototype.up = function (point) {
        return true;
    };
    return SelectionTool;
}(ActivatableTool));
exports.SelectionTool = SelectionTool;
var FigureTool = /** @class */ (function (_super) {
    __extends(FigureTool, _super);
    function FigureTool() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FigureTool.prototype.move = function (point) {
        if (!this.currentPoint) {
            this.currentPoint = point.copy();
            this.points.push(this.currentPoint);
        }
        this.currentPoint.set(point);
        return true;
    };
    FigureTool.prototype.up = function (point) {
        if (!this.currentPoint)
            return;
        this.currentPoint = point.copy();
        this.points.push(this.currentPoint);
        return true;
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
        main_1.protractr.sketch.figures.push(this.currentFigure);
        return true;
    };
    PointTool.prototype.up = function (point) {
        if (this.currentFigure) {
            this.currentFigure = null;
        }
        return true;
    };
    PointTool.prototype.move = function (point) {
        if (this.currentFigure) {
            this.currentFigure.p.set(point);
            return true;
        }
        return false;
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
        this.currentFigure = new figures_1.LineFigure(point, point.copy());
        main_1.protractr.sketch.figures.push(this.currentFigure);
        return true;
    };
    LineTool.prototype.up = function (point) {
        if (this.currentFigure) {
            this.currentFigure = null;
        }
        return true;
    };
    LineTool.prototype.move = function (point) {
        if (this.currentFigure) {
            this.currentFigure.p2.set(point);
            return true;
        }
        return false;
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
        this.currentFigure = new figures_1.CircleFigure(point, point.copy());
        main_1.protractr.sketch.figures.push(this.currentFigure);
        return true;
    };
    CircleTool.prototype.up = function (point) {
        if (this.currentFigure) {
            this.currentFigure = null;
        }
        return true;
    };
    CircleTool.prototype.move = function (point) {
        if (this.currentFigure) {
            this.currentFigure.r = point.distTo(this.currentFigure.c);
            return true;
        }
        return false;
    };
    return CircleTool;
}(FigureTool));
exports.CircleTool = CircleTool;

},{"../gcs/figures":2,"../main":5}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toolbar_1 = require("./toolbar");
var infopane_1 = require("./infopane");
var sketchview_1 = require("./sketchview");
var UI = /** @class */ (function () {
    function UI(protractr, canvas, sidePane, toolbar) {
        this.protractr = protractr;
        this.infoPane = new infopane_1.InfoPane(sidePane);
        this.sketchView = new sketchview_1.SketchView(this, this.protractr.sketch, canvas);
        this.toolbar = new toolbar_1.Toolbar(toolbar, this.sketchView);
    }
    return UI;
}());
exports.UI = UI;

},{"./infopane":7,"./sketchview":8,"./toolbar":9}]},{},[5]);
