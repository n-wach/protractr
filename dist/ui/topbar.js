"use strict";
/**
 * @module ui/topbar
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var menubar_1 = require("./menubar");
var toolSelect_1 = require("./tools/toolSelect");
var toolFilterSelect_1 = require("./tools/toolFilterSelect");
var toolCreatePoint_1 = require("./tools/toolCreatePoint");
var toolCreateLine_1 = require("./tools/toolCreateLine");
var toolCreateCircle_1 = require("./tools/toolCreateCircle");
var toolCreateRect_1 = require("./tools/toolCreateRect");
var actionUndo_1 = require("./actions/actionUndo");
var actionRedo_1 = require("./actions/actionRedo");
var actionImport_1 = require("./actions/actionImport");
var actionExport_1 = require("./actions/actionExport");
var toolCreateArc_1 = require("./tools/toolCreateArc");
var actionLatex_1 = require("./actions/actionLatex");
var TopBar = /** @class */ (function () {
    function TopBar(protractr, topBarElement) {
        this.menuBar = new menubar_1.MenuBar();
        this.toolGroup = new menubar_1.ToolGroup();
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolSelect_1.default(protractr), "Select and move figures", "drag.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolFilterSelect_1.default(protractr, ":*point"), "Select and move points", "filter-point.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolFilterSelect_1.default(protractr, ":*line"), "Select and move lines", "filter-line.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolFilterSelect_1.default(protractr, ":*circle"), "Select and move circles", "filter-circle.png"));
        this.menuBar.addDivider();
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolCreatePoint_1.default(protractr), "Create a point", "point.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolCreateLine_1.default(protractr), "Create a line", "line.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolCreateRect_1.default(protractr), "Create a rectangle", "rect.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolCreateCircle_1.default(protractr), "Create a circle", "circle.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolCreateArc_1.default(protractr), "Create an arc", "arc.png"));
        this.menuBar.addDivider();
        this.menuBar.addItem(new menubar_1.ActionMenuItem(new actionUndo_1.default(protractr), "Undo an action", "undo.png"));
        this.menuBar.addItem(new menubar_1.ActionMenuItem(new actionRedo_1.default(protractr), "Redo an action", "redo.png"));
        this.menuBar.addDivider();
        this.menuBar.addItem(new menubar_1.ActionMenuItem(new actionImport_1.default(protractr), "Import a sketch", "import.png"));
        this.menuBar.addItem(new menubar_1.ActionMenuItem(new actionExport_1.default(protractr), "Export a sketch", "export.png"));
        this.menuBar.addItem(new menubar_1.ActionMenuItem(new actionLatex_1.default(protractr), "Export to LaTeX", "latex.png"));
        topBarElement.appendChild(this.menuBar.div);
    }
    Object.defineProperty(TopBar.prototype, "activeTool", {
        get: function () {
            return this.toolGroup.selectedTool;
        },
        enumerable: true,
        configurable: true
    });
    return TopBar;
}());
exports.default = TopBar;
//# sourceMappingURL=topbar.js.map