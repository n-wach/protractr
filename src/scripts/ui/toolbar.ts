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
        this.activatableTools = new ActivatableToolGroup();
        this.activatableTools.addToolDropdown([new SelectTool(),
            new FilterSelectTool("Filter select to points", "filter-point.png", ":*point"),
            new FilterSelectTool("Filter select to lines", "filter-line.png", ":*line"),
            new FilterSelectTool("Filter select to circles", "filter-circle.png", ":*circle")
        ]);
        this.activatableTools.addTool(new PointTool());
        this.activatableTools.addTool(new LineTool());
        this.activatableTools.addTool(new RectTool());
        this.activatableTools.addTool(new CircleTool());
        this.addToolGroup(this.activatableTools);
        let editHistory = new ToolGroup();
        //editHistory.addTool(new UndoTool());
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
    addToolDropdown(tools: ActivatableTool[]) {
        let e = new DropdownToolSelect(this, tools);
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


class DropdownToolSelect extends ActivatableToolElement {
    availableTools: ActivatableTool[];
    ul: HTMLUListElement;
    lis: HTMLLIElement[]=[];
    constructor(parent: ToolGroup, tools: ActivatableTool[]) {
        super(parent, tools[0]);
        this.availableTools = tools;
        this.li.classList.add("tool-dropdown");
        this.ul = document.createElement("ul");
        this.ul.classList.add("tool-dropdown-content");
        for(let i = 0; i < tools.length - 1; i++) {
            let li = document.createElement("li");
            li.classList.add("tool");
            this.lis.push(li);
            this.ul.appendChild(li);
        }
        this.updateLis();
        this.li.appendChild(this.ul);
    }
    selectTool(tool) {
        this.tool = tool;
        this.li.title = this.tool.tooltip;
        this.li.style.backgroundImage = "url('../image/" + this.tool.image + "')";

        this.updateLis();
    }
    updateLis() {
        let toolIndex = 0;
        for(let liIndex = 0; liIndex < this.lis.length; liIndex++) {
            if(this.availableTools[toolIndex] == this.tool) {
                toolIndex++;
            }
            let tool = this.availableTools[toolIndex];
            let li = this.lis[liIndex];
            li.title = tool.tooltip;
            li.onclick = this.selectTool.bind(this, tool);
            li.style.backgroundImage = "url('../image/" + tool.image + "')";
            toolIndex += 1;
        }
    }
}

