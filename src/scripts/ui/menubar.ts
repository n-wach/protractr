/**
 * @module ui/menubar
 */
/** */

import Action from "./actions/action";
import Tool from "./tools/tool";

export class MenuBar {
    div: HTMLDivElement;
    roundNext: boolean = true;
    lastAdded: MenuItem = null;

    constructor() {
        this.div = document.createElement("div");
        this.div.classList.add("menu-bar")
    }

    addItem(item: MenuItem) {
        this.div.append(item.div);
        if (this.lastAdded) {
            this.lastAdded.div.style.borderBottomRightRadius = "0px";
            this.lastAdded.div.style.borderTopRightRadius = "0px";
        }
        if (this.roundNext) {
            item.div.style.borderBottomLeftRadius = "4px";
            item.div.style.borderTopLeftRadius = "4px";
            this.roundNext = false;
        }
        item.div.style.borderBottomRightRadius = "4px";
        item.div.style.borderTopRightRadius = "4px";
        this.lastAdded = item;
    }

    addDivider() {
        let divider = document.createElement("div");
        divider.classList.add("menu-divider");
        this.div.appendChild(divider);
        this.roundNext = true;
        this.lastAdded = null;
    }
}

export abstract class MenuItem {
    div: HTMLDivElement;
    selected: boolean = false;

    protected constructor(tooltip: string, icon: string) {
        this.div = document.createElement("div");
        this.div.classList.add("menu-item");
        this.div.title = tooltip;
        this.div.style.backgroundImage = "url('../image/" + icon + "')";
        this.div.addEventListener("click", this.click.bind(this))
    }

    setSelected(selected: boolean) {
        if (selected) {
            this.div.classList.add("selected");
        } else {
            this.div.classList.remove("selected");
        }
        this.selected = selected;
    }

    abstract click();
}

export class ActionMenuItem extends MenuItem {
    action: Action;

    constructor(action: Action, tooltip: string, icon: string) {
        super(tooltip, icon);
        this.action = action;
    }

    click() {
        this.action.use();
    }
}

export class ToolMenuItem extends MenuItem {
    tool: Tool;
    toolGroup: ToolGroup;

    constructor(toolGroup: ToolGroup, tool: Tool, tooltip: string, icon: string) {
        super(tooltip, icon);
        this.toolGroup = toolGroup;
        this.tool = tool;
        this.toolGroup.addTool(this);
    }

    click() {
        this.toolGroup.selectTool(this);
    }
}

export class ToolGroup {
    selectedTool: Tool = null;
    toolMenuItems: ToolMenuItem[] = [];

    addTool(toolMenuItem: ToolMenuItem) {
        this.toolMenuItems.push(toolMenuItem);
        if (this.selectedTool == null) this.selectTool(toolMenuItem);
    }

    selectTool(toolMenuItem: ToolMenuItem) {
        this.selectedTool = toolMenuItem.tool;
        for(let tool of this.toolMenuItems) {
            tool.setSelected(tool == toolMenuItem);
        }
    }
}