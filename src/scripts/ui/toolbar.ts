import {ActivatableTool, CircleTool, LineTool, PointTool, RedoTool, Tool, UndoTool} from "./tools";
import {Protractr} from "../protractr";
import {SketchView} from "./sketchview";

export class Toolbar {
    toolElements: ToolElement[];
    protractr: Protractr;
    toolbarElement: HTMLUListElement;
    sketchView: SketchView;

    constructor(toolbarElement: HTMLUListElement, sketchView: SketchView) {
        this.sketchView = sketchView;
        this.toolbarElement = toolbarElement;
        this.toolElements = [];
        this.initializeTools();
    }
    initializeTools() {
        this.addTool(new PointTool(), "point.png");
        this.addTool(new LineTool(), "line.png");
        this.addTool(new CircleTool(), "circle.png");
        this.addTool(new Tool("Arc", "Create an arc"), "arc.png");
        this.addTool(new UndoTool(), "undo.png");
        this.addTool(new RedoTool(), "redo.png");
    }
    addTool(tool: Tool, image: string) {
        let e = new ToolElement(tool, image);
        e.tool.toolbar = this;
        this.toolElements.push(e);
        this.toolbarElement.appendChild(e.li);
    }
    setActive(tool: Tool) {
        this.sketchView.subscribeTool(tool);
        for(let e of this.toolElements) {
            if(e.tool == tool) {
                e.activate();
            } else {
                e.deactivate();
            }
        }
        this.sketchView.draw();
    }
}

class ToolElement {
    li: HTMLLIElement;
    tool: Tool;
    constructor(tool: Tool, image: string) {
        this.tool = tool;
        this.li = document.createElement("li");
        this.li.title = tool.tooltip;
        this.li.classList.add("tool");
        this.li.style.backgroundImage = "url('../image/" + image + "')";
        this.li.addEventListener("click", this.tool.used.bind(tool));
    }
    activate() {
        this.li.classList.add("tool-active");
        (this.tool as ActivatableTool).active = true;
    }
    deactivate() {
        this.li.classList.remove("tool-active");
        (this.tool as ActivatableTool).active = false;
    }
}
