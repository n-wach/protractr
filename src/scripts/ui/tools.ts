import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "../gcs/figures";
import {protractr, saveAs} from "../main";
import {Toolbar} from "./toolbar";
import {
    ArcPointCoincidentConstraint,
    ColinearPointsConstraint,
    EqualConstraint,
    MidpointConstraint
} from "../gcs/constraint";
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
        protractr.ui.sketchView.pushState();
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
            protractr.ui.sketchView.pushState();
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
            protractr.ui.sketchView.pushState();
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

export class RectTool extends ActivatableTool {
    point1: Point;
    point1SnapFigure: Figure;
    point1Set: boolean;
    point2: Point;
    constructor() {
        super("Rectangle", "Create a rectangle", "rect.png");
    }
    up(point: Point, snapFigure: Figure) {
        if(!this.point1Set) {
            this.point1 = point;
            this.point1SnapFigure = snapFigure;
            this.point1Set = true;
            this.point2 = point;
        } else {
            let p1 = this.point1;
            let p2 = new Point(this.point2.x, this.point1.y);
            let p3 = this.point2;
            let p4 = new Point(this.point1.x, this.point2.y);

            let h1 = new LineFigure(p1.copy(), p2.copy());
            let v1 = new LineFigure(p2.copy(), p3.copy());
            let h2 = new LineFigure(p3.copy(), p4.copy());
            let v2 = new LineFigure(p4.copy(), p1.copy());

            protractr.sketch.rootFigures.push(h1, h2, v1, v2);

            let hc1 = new EqualConstraint([h1.p1.variablePoint.y, h1.p2.variablePoint.y, v1.p1.variablePoint.y, v2.p2.variablePoint.y], "horizontal");
            let hc2 = new EqualConstraint([h2.p1.variablePoint.y, h2.p2.variablePoint.y, v2.p1.variablePoint.y, v1.p2.variablePoint.y], "horizontal");
            let vc1 = new EqualConstraint([v1.p1.variablePoint.x, v1.p2.variablePoint.x, h1.p2.variablePoint.x, h2.p1.variablePoint.x], "vertical");
            let vc2 = new EqualConstraint([v2.p1.variablePoint.x, v2.p2.variablePoint.x, h1.p1.variablePoint.x, h2.p2.variablePoint.x], "vertical");

            protractr.sketch.addConstraints([hc1, hc2, vc1, vc2]);

            constrainPointBySnap(h1.p1, this.point1SnapFigure);
            constrainPointBySnap(v2.p2, this.point1SnapFigure);
            constrainPointBySnap(v1.p2, snapFigure);
            constrainPointBySnap(h2.p1, snapFigure);

            protractr.ui.sketchView.pushState();
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
            let p3 = new Point(this.point2.x, this.point1.y);
            let p4 = new Point(this.point1.x, this.point2.y);
            sketchView.drawPoint(this.point2);
            sketchView.drawPoint(p3);
            sketchView.drawPoint(p4);
            sketchView.drawLine(this.point1, p3);
            sketchView.drawLine(p3, this.point2);
            sketchView.drawLine(this.point2, p4);
            sketchView.drawLine(p4, this.point1);
        }
    }
    reset() {
        this.point1Set = false;
        this.point1SnapFigure = null;
        this.point1 = null;
        this.point2 = null;
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
            let p1 = (snapFigure as LineFigure).p1;
            let p2 = (snapFigure as LineFigure).p2;
            let midpoint = Point.averagePoint(p1, p2);
            if(midpoint.distTo(point) < 5 / protractr.ui.sketchView.ctxScale) {
                protractr.sketch.addConstraints([new MidpointConstraint(p1.variablePoint, p2.variablePoint, p)]);
            } else {
                protractr.sketch.addConstraints([new ColinearPointsConstraint([p1.variablePoint, p2.variablePoint, p])]);
            }
            break;
    }
}
