import {
    ActivatableTool,
    CircleTool,
    LineTool,
    PointTool,
    ImportTool,
    Tool,
    ExportTool,
    UndoTool,
    RedoTool, SelectTool, RectTool
} from "./tools";
import {Protractr} from "../protractr";
import {SketchView} from "./sketchview";

export class Toolbar {
    toolElements: ToolElement[];
    protractr: Protractr;
    toolbarElement: HTMLUListElement;
    sketchView: SketchView;
    activatableTools: ActivatableToolGroup;

    constructor(toolbarElement: HTMLUListElement, sketchView: SketchView) {
        this.sketchView = sketchView;
        this.toolbarElement = toolbarElement;
        this.toolElements = [];
        this.initializeTools();
    }
    initializeTools() {
        let filters = new ToolGroup();
        this.activatableTools = new ActivatableToolGroup();
        this.activatableTools.addTool(new SelectTool());
        this.activatableTools.addTool(new PointTool());
        this.activatableTools.addTool(new LineTool());
        this.activatableTools.addTool(new RectTool());
        this.activatableTools.addTool(new CircleTool());
        this.addToolGroup(this.activatableTools);
        let editHistory = new ToolGroup();
        editHistory.addTool(new UndoTool());
        editHistory.addTool(new RedoTool());
        this.addToolGroup(editHistory);
        let importExport = new ToolGroup();
        importExport.addTool(new ImportTool());
        importExport.addTool(new ExportTool());
        this.addToolGroup(importExport);
    }
    addToolGroup(group: ToolGroup) {
        this.toolbarElement.appendChild(group.div);
    }
    get activeTool(): ActivatableTool {
        return this.activatableTools.activeTool;
    }
}

class ToolGroup {
    div: HTMLDivElement;
    toolElements: ToolElement[];
    constructor() {
        this.div = document.createElement("div");
        this.div.classList.add("tool-group");
        this.toolElements = [];
    }
    addTool(tool: Tool) {
        let e = new ToolElement(this, tool);
        this.toolElements.push(e);
        this.div.appendChild(e.li);
    }
}

class ActivatableToolGroup extends ToolGroup {
    toolElements: ActivatableToolElement[];
    activeTool: ActivatableTool;
    addTool(tool: Tool) {
        let e = new ActivatableToolElement(this, tool);
        this.toolElements.push(e);
        this.div.appendChild(e.li);
        this.select(this.toolElements[0]);
    }
    select(toolElement: ActivatableToolElement) {
        for(let element of this.toolElements) {
            if(element == toolElement) {
                element.activate();
                this.activeTool = element.tool;
            } else {
                element.deactivate();
            }
        }
    }
}


class ToolElement {
    li: HTMLLIElement;
    tool: Tool;
    parent: ToolGroup;
    constructor(parent: ToolGroup, tool: Tool) {
        this.parent = parent;
        this.tool = tool;
        this.li = document.createElement("li");
        this.li.title = tool.tooltip;
        this.li.classList.add("tool");
        this.li.style.backgroundImage = "url('../image/" + tool.image + "')";
        this.li.addEventListener("mousedown", this.press.bind(this));
        this.li.addEventListener("mouseleave", this.unpress.bind(this));
        this.li.addEventListener("mouseup", this.unpress.bind(this));
        this.li.addEventListener("click", this.click.bind(this));
    }
    press() {
        this.li.classList.add("pressed");
    }
    unpress() {
        this.li.classList.remove("pressed");
    }
    click() {
        this.tool.used();
    }
}


class ActivatableToolElement extends ToolElement {
    tool: ActivatableTool;
    parent: ActivatableToolGroup;
    click() {
        this.parent.select(this);
    }
    activate() {
        this.li.classList.add("active");
    }
    deactivate() {
        this.tool.reset();
        this.li.classList.remove("active");
    }
}

