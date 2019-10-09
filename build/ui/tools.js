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
//# sourceMappingURL=tools.js.map