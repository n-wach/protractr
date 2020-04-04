/**
 * @module ui/topbar
 */
/** */

import Protractr from "../protractr";
import {ActionMenuItem, MenuBar, ToolGroup, ToolMenuItem} from "./menubar";
import ToolSelect from "./tools/toolSelect";
import ToolFilterSelect from "./tools/toolFilterSelect";
import ToolCreatePoint from "./tools/toolCreatePoint";
import ToolCreateLine from "./tools/toolCreateLine";
import ToolCreateCircle from "./tools/toolCreateCircle";
import ToolCreateRect from "./tools/toolCreateRect";
import ActionUndo from "./actions/actionUndo";
import ActionRedo from "./actions/actionRedo";
import ActionImport from "./actions/actionImport";
import ActionExport from "./actions/actionExport";
import Tool from "./tools/tool";
import ToolCreateArc from "./tools/toolCreateArc";
import ActionLatex from "./actions/actionLatex";

export default class TopBar {
    menuBar: MenuBar;
    toolGroup: ToolGroup;

    constructor(protractr: Protractr, topBarElement: HTMLDivElement) {
        this.menuBar = new MenuBar();
        this.toolGroup = new ToolGroup();

        this.menuBar.addItem(new ToolMenuItem(this.toolGroup,
            new ToolSelect(protractr),
            "Select and move figures", "drag.png"));
        this.menuBar.addItem(new ToolMenuItem(this.toolGroup,
            new ToolFilterSelect(protractr, ":*point"),
            "Select and move points", "filter-point.png"));
        this.menuBar.addItem(new ToolMenuItem(this.toolGroup,
            new ToolFilterSelect(protractr, ":*line"),
            "Select and move lines", "filter-line.png"));
        this.menuBar.addItem(new ToolMenuItem(this.toolGroup,
            new ToolFilterSelect(protractr, ":*circle"),
            "Select and move circles", "filter-circle.png"));
        this.menuBar.addDivider();

        this.menuBar.addItem(new ToolMenuItem(this.toolGroup,
            new ToolCreatePoint(protractr),
            "Create a point", "point.png"));
        this.menuBar.addItem(new ToolMenuItem(this.toolGroup,
            new ToolCreateLine(protractr),
            "Create a line", "line.png"));
        this.menuBar.addItem(new ToolMenuItem(this.toolGroup,
            new ToolCreateRect(protractr),
            "Create a rectangle", "rect.png"));
        this.menuBar.addItem(new ToolMenuItem(this.toolGroup,
            new ToolCreateCircle(protractr),
            "Create a circle", "circle.png"));
        this.menuBar.addItem(new ToolMenuItem(this.toolGroup,
            new ToolCreateArc(protractr),
            "Create an arc", "arc.png"));
        this.menuBar.addDivider();

        this.menuBar.addItem(new ActionMenuItem(new ActionUndo(protractr), "Undo an action", "undo.png"));
        this.menuBar.addItem(new ActionMenuItem(new ActionRedo(protractr), "Redo an action", "redo.png"));
        this.menuBar.addDivider();

        this.menuBar.addItem(new ActionMenuItem(new ActionImport(protractr), "Import a sketch", "import.png"));
        this.menuBar.addItem(new ActionMenuItem(new ActionExport(protractr), "Export a sketch", "export.png"));
        this.menuBar.addItem(new ActionMenuItem(new ActionLatex(protractr), "Export to LaTeX", "latex.png"));

        topBarElement.appendChild(this.menuBar.div);
    }

    get activeTool(): Tool {
        return this.toolGroup.selectedTool;
    }
}
