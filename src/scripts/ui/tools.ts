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

export class ActivatableTool extends Tool {
    active: boolean = false;
    used() {
        if(this.active) {
            this.toolbar.setActive(null);
            this.active = false;
            if(this.currentFigure != null) {
                this.currentFigure = null;
                protractr.sketch.figures.pop();
            }
        } else {
            this.toolbar.setActive(this);
            this.active = true;
        }
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
    }
    up(point) {
        if(!this.currentPoint) return;
        this.currentPoint = point.copy();
        this.points.push(this.currentPoint);
    }
}

export class PointTool extends FigureTool {
    currentFigure: PointFigure;
    constructor() {
        super("Point", "Create a point");
    }
    up(point) {
        if(this.currentFigure) {
            this.currentFigure = null;
        }
    }
    move(point) {
        if(this.currentFigure) {
            this.currentFigure.p.set(point);
        } else {
            this.currentFigure = new PointFigure(point);
            protractr.sketch.figures.push(this.currentFigure);
        }
    }
}

export class LineTool extends FigureTool {
    currentFigure: LineFigure;
    hasSetP1: boolean = false;
    constructor() {
        super("Line", "Create a line");
    }
    up(point) {
        if(this.currentFigure) {
            if(this.hasSetP1) {
                this.currentFigure.p2.set(point);
                this.currentFigure = null;
            } else {
                this.hasSetP1 = true;
                this.currentFigure.p1.set(point);
            }
        }
    }
    move(point) {
        if(this.currentFigure) {
            if(!this.hasSetP1) {
                this.currentFigure.p1.set(point);
            }
            this.currentFigure.p2.set(point);
        } else {
            this.hasSetP1 = false;
            this.currentFigure = new LineFigure(point, point.copy());
            protractr.sketch.figures.push(this.currentFigure);
        }
    }
}


export class CircleTool extends FigureTool {
    currentFigure: CircleFigure;
    hasSetC: boolean = false;
    constructor() {
        super("Circle", "Create a circle");
    }
    up(point) {
        if(this.currentFigure) {
            if(this.hasSetC) {
                this.currentFigure.r = this.currentFigure.c.distTo(point);
                this.currentFigure = null;
            } else {
                this.hasSetC = true;
                this.currentFigure.c.set(point);
            }
        }
        return true;
    }
    move(point) {
        if(this.currentFigure) {
            if(!this.hasSetC) {
                this.currentFigure.c.set(point);
            }
            this.currentFigure.r = this.currentFigure.c.distTo(point);
        } else {
            this.hasSetC = false;
            this.currentFigure = new CircleFigure(point, 0);
            protractr.sketch.figures.push(this.currentFigure);
        }
    }
}



