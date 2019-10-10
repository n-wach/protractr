import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "../gcs/figures";
import {protractr} from "../main";
import {Toolbar} from "./toolbar";

export class Tool {
    name: string;
    tooltip: string;
    currentFigure: Figure;
    toolbar: Toolbar;
    constructor(name: string, tooltip: string) {
        this.name = name;
        this.tooltip = tooltip;
    }
    used() {

    }
    down(point) {

    }
    up(point) {

    }
    move(point) {

    }
}

export class UndoTool extends Tool {
    constructor() {
        super("Undo", "Undo the most recent action");
    }
    used() {
        alert("Undo");
    }
}

export class RedoTool extends Tool {
    constructor() {
        super("Redo", "Redo the most recent undo");
    }
    used() {
        alert("Redo");
    }
}

class ActivatableTool extends Tool {
    used() {
        this.toolbar.setActive(this);
    }
}

export class FigureTool extends ActivatableTool {
    points: Point[];
    used() {
        super.used();
    }
}

export class PointTool extends FigureTool {
    constructor() {
        super("Point", "Create a point");
    }
    down(point) {
        this.currentFigure = new PointFigure(point);
        this.currentFigure.selected = true;
        protractr.sketch.figures.push(this.currentFigure);
    }
    up(point) {
        if(this.currentFigure) {
            this.currentFigure.selected = false;
            this.currentFigure = null;
        }
    }
    move(point) {
        if(this.currentFigure) {
            (this.currentFigure as PointFigure).p.set(point);
        }
    }
}

export class LineTool extends FigureTool {
    constructor() {
        super("Line", "Create a line");
    }
    down(point) {
        this.up(point);
        this.currentFigure = new LineFigure(new PointFigure(point), new PointFigure(point.copy()));
        this.currentFigure.selected = true;
        (this.currentFigure as LineFigure).p2.selected = true;
        protractr.sketch.figures.push(this.currentFigure);
    }
    up(point) {
        if(this.currentFigure) {
            (this.currentFigure as LineFigure).p2.selected = false;
            this.currentFigure.selected = false;
            this.currentFigure = null;
        }
    }
    move(point) {
        if(this.currentFigure) {
            (this.currentFigure as LineFigure).p2.p.set(point);
        }
    }
}


export class CircleTool extends FigureTool {
    currentFigure: CircleFigure;
    constructor() {
        super("Circle", "Create a circle");
    }
    down(point) {
        this.up(point);
        this.currentFigure = new CircleFigure(new PointFigure(point), point.copy());
        this.currentFigure.selected = true;
        protractr.sketch.figures.push(this.currentFigure);
    }
    up(point) {
        if(this.currentFigure) {
            this.currentFigure.selected = false;
            this.currentFigure = null;
        }
    }
    move(point) {
        if(this.currentFigure) {
            this.currentFigure.r = point.distTo(this.currentFigure.c.p);
        }
    }
}



