import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "../gcs/figures";
import {protractr} from "../main";
import {Toolbar} from "./toolbar";
import {ArcPointCoincidentConstraint, ColinearPointsConstraint, EqualConstraint} from "../gcs/constraint";


export class Tool {
    name: string;
    tooltip: string;
    currentFigure: Figure;
    toolbar: Toolbar;
    constructor(name: string, tooltip: string) {
        this.name = name;
        this.tooltip = tooltip;
    }

    down(point){};

    move(point){};

    up(point, snapFigure: Figure){};

    used(){};
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
                protractr.sketch.rootFigures.pop();
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
    up(point, snapFigure: Figure) {
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
    up(point, snapFigure: Figure) {
        if(this.currentFigure) {
            if(snapFigure) {
                constrainPointBySnap(this.currentFigure.p, snapFigure);
            }
            this.currentFigure = null;
        }
    }
    move(point) {
        if(this.currentFigure) {
            this.currentFigure.p.set(point);
        } else {
            this.currentFigure = new PointFigure(point);
            protractr.sketch.rootFigures.push(this.currentFigure);
        }
    }
}

function constrainPointBySnap(point, snapFigure) {
    let p = point.variablePoint;
    switch(snapFigure.type) {
        case "point":
            let v1 = (snapFigure as PointFigure).p.variablePoint;
            let ex = new EqualConstraint([v1.x, p.x]);
            let ey = new EqualConstraint([v1.y, p.y]);
            protractr.sketch.addConstraints([ex, ey])
            break;
        case "circle":
            let r = (snapFigure as CircleFigure).r;
            let c = (snapFigure as CircleFigure).c.variablePoint;
            protractr.sketch.addConstraints([new ArcPointCoincidentConstraint(c, r, [p])]);
            break;
        case "line":
            let p1 = (snapFigure as LineFigure).p1.variablePoint;
            let p2 = (snapFigure as LineFigure).p2.variablePoint;
            protractr.sketch.addConstraints([new ColinearPointsConstraint([p1, p2, p])]);
            break;
    }
}

export class LineTool extends FigureTool {
    currentFigure: LineFigure;
    hasSetP1: boolean = false;
    constructor() {
        super("Line", "Create a line");
    }
    up(point, snapFigure: Figure) {
        if(this.currentFigure) {
            if(this.hasSetP1) {
                this.currentFigure.p2.set(point);
                if(snapFigure) {
                    constrainPointBySnap(this.currentFigure.p2, snapFigure);
                }
                this.currentFigure = null;
            } else {
                this.hasSetP1 = true;
                this.currentFigure.p1.set(point);
                if(snapFigure) {
                    constrainPointBySnap(this.currentFigure.p1, snapFigure);
                }
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
            protractr.sketch.rootFigures.push(this.currentFigure);
        }
    }
}


export class CircleTool extends FigureTool {
    currentFigure: CircleFigure;
    hasSetC: boolean = false;
    constructor() {
        super("Circle", "Create a circle");
    }
    up(point, snapFigure: Figure) {
        if(this.currentFigure) {
            if(this.hasSetC) {
                this.currentFigure.r.value = this.currentFigure.c.distTo(point);
                this.currentFigure = null;
            } else {
                this.hasSetC = true;
                this.currentFigure.c.set(point);
                if(snapFigure) {
                    constrainPointBySnap(this.currentFigure.c, snapFigure);
                }
            }
        }
        return true;
    }
    move(point) {
        if(this.currentFigure) {
            if(!this.hasSetC) {
                this.currentFigure.c.set(point);
            }
            this.currentFigure.r.value = this.currentFigure.c.distTo(point);
        } else {
            this.hasSetC = false;
            this.currentFigure = new CircleFigure(point, 0);
            protractr.sketch.rootFigures.push(this.currentFigure);
        }
    }
}

