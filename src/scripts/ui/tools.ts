import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "../gcs/figures";
import {protractr, saveAs} from "../main";
import {Toolbar} from "./toolbar";
import {ArcPointCoincidentConstraint, ColinearPointsConstraint, EqualConstraint} from "../gcs/constraint";
import {SketchView} from "./sketchview";
import {Protractr} from "../protractr";


export abstract class Tool {
    name: string;
    image: string;
    tooltip: string;
    constructor(name: string, tooltip: string, image: string) {
        this.name = name;
        this.tooltip = tooltip;
        this.image = image;
    }
    abstract used();
}

export class UndoTool extends Tool {
    constructor() {
        super("Undo", "Undo an action", "undo.png");
    }
    used() {
        protractr.loadSketch(protractr.ui.history.undo())
    }
}

export class RedoTool extends Tool {
    constructor() {
        super("Redo", "Redo an action", "redo.png");
    }
    used() {
        protractr.loadSketch(protractr.ui.history.redo());
    }
}

export class ExportTool extends Tool {
    constructor() {
        super("Export", "Export your Sketch", "export.png");
    }
    used() {
        saveAs(protractr.exportSketch(), "sketch.json");
    }
}

export class ImportTool extends Tool {
    constructor() {
        super("Import", "Import a Sketch from a file or web", "import.png");
    }
    used() {
        let input = prompt("JSON or URL to import");
        if(input[0] == "{") {
            protractr.loadSketch(input);
        } else {
            protractr.loadFromURL(input);
        }
    }
}


export abstract class ActivatableTool extends Tool {
    doSnap: boolean=true;
    used() {}
    abstract down(point: Point, snapFigure: Figure);
    abstract up(point: Point, snapFigure: Figure);
    abstract move(point: Point, snapFigure: Figure);
    abstract draw(sketchView: SketchView);
    abstract reset();
}

export class SelectTool extends ActivatableTool {
    selectionStart: Point;
    selectionEnd: Point;
    dragging: boolean;
    pressed: boolean;
    downFigure: Figure;
    lastDrag: Point;
    constructor() {
        super("Select", "Select and edit figures", "drag.png");
        this.doSnap = false;
    }
    down(point: Point, snapFigure: Figure) {
        this.pressed = true;
        this.downFigure = snapFigure;
        if(!this.downFigure) {
            protractr.ui.infoPane.selectedFiguresList.clear();
            this.selectionStart = point;
            this.selectionEnd = point;
        } else {
            this.downFigure.setLocked(true);
            this.lastDrag = point.copy();
        }
    }

    draw(sketchView: SketchView) {
        if(!this.selectionStart || !this.selectionEnd) return;
        sketchView.ctx.fillStyle = "green";
        sketchView.ctx.globalAlpha = 0.5;
        let w = this.selectionEnd.x - this.selectionStart.x;
        let h = this.selectionEnd.y - this.selectionStart.y;
        sketchView.ctx.fillRect(this.selectionStart.x, this.selectionStart.y, w, h);
        sketchView.ctx.globalAlpha = 1;
        sketchView.ctx.strokeStyle = "green";
        sketchView.ctx.strokeRect(this.selectionStart.x, this.selectionStart.y, w, h);
    }

    move(point: Point, snapFigure: Figure) {
        if(this.pressed) this.dragging = true;
        if(this.downFigure && this.dragging) {
            this.downFigure.setLocked(false);
            this.downFigure.translate(this.lastDrag, point.copy());
            this.downFigure.setLocked(true);
            protractr.sketch.solveConstraints();
            this.lastDrag = point.copy();
        } else {
            this.selectionEnd = point;
            if (this.selectionStart) {
                let selection = [];
                for (let figure of protractr.sketch.rootFigures) {
                    for (let relatedFigure of figure.getRelatedFigures()) {
                        if (this.figureInSelection(relatedFigure)) {
                            selection.push(relatedFigure);
                        }
                    }
                }
                protractr.ui.infoPane.selectedFiguresList.setFigures(selection);
            }
        }
    }

    up(point: Point, snapFigure: Figure) {
        if(this.downFigure) {
            protractr.sketch.solveConstraints();
            this.downFigure.setLocked(false);
            if(!protractr.sketch.solveConstraints(true)) {
                alert("That state couldn't be solved...");
            }
            protractr.ui.sketchView.pushState();
        }
        if(!this.dragging && this.downFigure) {
            let list = protractr.ui.infoPane.selectedFiguresList;
            if(list.figureSelected(this.downFigure)) {
                list.removeFigure(this.downFigure);
            } else {
                list.addFigure(this.downFigure);
            }
        }
        this.reset();
    }

    reset() {
        this.selectionEnd = null;
        this.selectionStart = null;
        this.dragging = false;
        this.pressed = false;
    }

    figureInSelection(figure: Figure) {
        if(figure.type == "point") {
            let p = (figure as PointFigure).p;
            return (
                    (this.selectionStart.x > p.x && this.selectionEnd.x < p.x) ||
                    (this.selectionStart.x < p.x && this.selectionEnd.x > p.x)
                ) &&
                (
                    (this.selectionStart.y > p.y && this.selectionEnd.y < p.y) ||
                    (this.selectionStart.y < p.y && this.selectionEnd.y > p.y)
                );
        }

        let p1 = this.selectionStart;
        let p2 = new Point(this.selectionStart.x, this.selectionEnd.y);
        let p3 = this.selectionEnd;
        let p4 = new Point(this.selectionEnd.x, this.selectionStart.y);

        if(figure.type == "line") {
            let line = (figure as LineFigure);
            if (this.figureInSelection(line.childFigures[0]) || this.figureInSelection(line.childFigures[1])) {
                return true;
            }
            //test if line intersects any of the edges
            if (Point.doIntersect(p1, p2, line.p1, line.p2)) return true;
            if (Point.doIntersect(p2, p3, line.p1, line.p2)) return true;
            if (Point.doIntersect(p3, p4, line.p1, line.p2)) return true;
            if (Point.doIntersect(p4, p1, line.p1, line.p2)) return true;
            return false;
        } else if (figure.type == "circle") {
                let circle = (figure as CircleFigure);
                //test if circle intersects any of the edges... somehow...
                return false;
        }
        return false;
    }
}

export class PointTool extends ActivatableTool {
    point: Point;
    constructor() {
        super("Point", "Create a point", "point.png");
    }
    down(point: Point, snapFigure: Figure) {

    }
    up(point: Point, snapFigure: Figure) {
        let pointFigure = new PointFigure(point);
        constrainPointBySnap(pointFigure.p, snapFigure);
        protractr.sketch.rootFigures.push(pointFigure);
    }
    move(point: Point, snapFigure: Figure) {
        this.point = point;
    }
    draw(sketchView: SketchView) {
        sketchView.drawPoint(this.point);
    }
    reset() {
        this.point = null;
    }
}

export class LineTool extends ActivatableTool {
    point1: Point;
    point1SnapFigure: Figure;
    point1Set: boolean;
    point2: Point;
    constructor() {
        super("Line", "Create a line", "line.png");
    }
    up(point: Point, snapFigure: Figure) {
        if(!this.point1Set) {
            this.point1 = point;
            this.point1SnapFigure = snapFigure;
            this.point1Set = true;
            this.point2 = point;
        } else {
            let lineFigure = new LineFigure(this.point1, this.point2);
            constrainPointBySnap(lineFigure.p1, this.point1SnapFigure);
            constrainPointBySnap(lineFigure.p2, snapFigure);
            protractr.sketch.rootFigures.push(lineFigure);
            this.reset();
        }
    }
    move(point: Point, snapFigure: Figure) {
        if(!this.point1Set) {
            this.point1 = point;
        } else {
            this.point2 = point;
        }
    }

    down(point: Point, snapFigure: Figure) {
    }

    draw(sketchView: SketchView) {
        sketchView.drawPoint(this.point1);
        if(this.point1Set) {
            sketchView.drawPoint(this.point2);
            sketchView.drawLine(this.point1, this.point2);
        }
    }
    reset() {
        this.point1Set = false;
        this.point1SnapFigure = null;
        this.point1 = null;
        this.point2 = null;
    }
}


export class CircleTool extends ActivatableTool {
    center: Point;
    centerSnapFigure: Figure;
    centerSet: boolean;
    radius: number;
    constructor() {
        super("Circle", "Create a circle", "circle.png");
    }
    up(point: Point, snapFigure: Figure) {
        if(!this.centerSet) {
            this.centerSet = true;
            this.center = point;
            this.centerSnapFigure = snapFigure;
        } else {
            this.radius = this.center.distTo(point);
            let circleFigure = new CircleFigure(this.center, this.radius);
            constrainPointBySnap(circleFigure.c, this.centerSnapFigure);
            //constrain point on circle
            if(snapFigure && snapFigure.type == "point") {
                let r = circleFigure.r;
                let c = circleFigure.c.variablePoint;
                let p = (snapFigure as PointFigure).p.variablePoint;
                protractr.sketch.addConstraints([new ArcPointCoincidentConstraint(c, r, [p])]);
            }
            protractr.sketch.rootFigures.push(circleFigure);
            this.reset();
        }
    }
    move(point: Point, snapFigure: Figure) {
        if(!this.centerSet) {
            this.center = point;
        } else {
            this.radius = this.center.distTo(point);
        }
    }

    down(point: Point, snapFigure: Figure) {

    }

    draw(sketchView: SketchView) {
        sketchView.drawPoint(this.center);
        if(this.centerSet) {
            sketchView.drawCircle(this.center, this.radius);
        }
    }

    reset() {
        this.radius = 0;
        this.center = null;
        this.centerSet = false;
        this.centerSnapFigure = null;
    }
}


function constrainPointBySnap(point, snapFigure) {
    if(!snapFigure) return;
    let p = point.variablePoint;
    switch(snapFigure.type) {
        case "point":
            let v1 = (snapFigure as PointFigure).p.variablePoint;
            let ex = new EqualConstraint([v1.x, p.x], "vertical");
            let ey = new EqualConstraint([v1.y, p.y], "horizontal");
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
