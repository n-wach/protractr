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
//# sourceMappingURL=toolbar.js.map