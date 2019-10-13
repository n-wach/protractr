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
    down(point): boolean {
        return false;
    }
    up(point): boolean {
        return false;
    }
    move(point): boolean {
        return false;
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
    active: boolean = false;
    used() {
        if(this.active) {
            this.toolbar.setActive(null);
            this.active = false;
        } else {
            this.toolbar.setActive(this);
            this.active = true;
        }
    }
}

export class SelectionTool extends ActivatableTool {
    constructor() {
        super("Select", "Select stuff");
    }
    move(point) {

        return false;
    }
    up(point) {

        return true;
    }
}

export class FigureTool extends ActivatableTool {
    points: Point[];
    currentPoint: Point;
    move(point) {
        if(!this.currentPoint) {
            this.currentPoint = point.copy();
            this.points.push(this.currentPoint);
        }
        this.currentPoint.set(point);
        return true;
    }
    up(point) {
        if(!this.currentPoint) return;
        this.currentPoint = point.copy();
        this.points.push(this.currentPoint);
        return true;
    }
}

export class PointTool extends FigureTool {
    constructor() {
        super("Point", "Create a point");
    }
    down(point) {
        this.currentFigure = new PointFigure(point);
        protractr.sketch.figures.push(this.currentFigure);
        return true;
    }
    up(point) {
        if(this.currentFigure) {
            this.currentFigure = null;
        }
        return true;
    }
    move(point) {
        if(this.currentFigure) {
            (this.currentFigure as PointFigure).p.set(point);
            return true;
        }
        return false;
    }
}

export class LineTool extends FigureTool {
    constructor() {
        super("Line", "Create a line");
    }
    down(point) {
        this.up(point);
        this.currentFigure = new LineFigure(point, point.copy());
        protractr.sketch.figures.push(this.currentFigure);
        return true;
    }
    up(point) {
        if(this.currentFigure) {
            this.currentFigure = null;
        }
        return true;
    }
    move(point) {
        if(this.currentFigure) {
            (this.currentFigure as LineFigure).p2.set(point);
            return true;
        }
        return false;
    }
}


export class CircleTool extends FigureTool {
    currentFigure: CircleFigure;
    constructor() {
        super("Circle", "Create a circle");
    }
    down(point) {
        this.up(point);
        this.currentFigure = new CircleFigure(point, point.copy());
        protractr.sketch.figures.push(this.currentFigure);
        return true;
    }
    up(point) {
        if(this.currentFigure) {
            this.currentFigure = null;
        }
        return true;
    }
    move(point) {
        if(this.currentFigure) {
            this.currentFigure.r = point.distTo(this.currentFigure.c);
            return true;
        }
        return false;
    }
}



