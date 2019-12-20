import Tool from "./tool";
import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "../../gcs/figures";
import {
    ArcPointCoincidentConstraint,
    ColinearPointsConstraint,
    EqualConstraint,
    MidpointConstraint
} from "../../gcs/constraint";

type FigureCreationPoint = { point: Point, snapFigure: Figure };

export default abstract class ToolCreateFigure extends Tool {
    points: FigureCreationPoint[];
    currentPoint: FigureCreationPoint;
    pointsPerFigure: number;

    protected constructor(protractr, pointsPerFigure: number) {
        super(protractr);
        this.pointsPerFigure = pointsPerFigure;
    }

    down(point: Point) {
        //do nothing
    }

    up(point: Point) {
        if (this.points.length >= this.pointsPerFigure) {
            this.addFigure();
            this.points = [];
            this.protractr.ui.pushState();
        }
        this.currentPoint = {point: null, snapFigure: null};
        this.points.push(this.currentPoint);
        this.updateFigureCreationPoint(this.currentPoint, point);
    }

    move(point: Point) {
        this.updateFigureCreationPoint(this.currentPoint, point);
    }

    reset() {
        this.currentPoint = {point: null, snapFigure: null};
        this.points = [this.currentPoint];
    }

    updateFigureCreationPoint(figureCreationPoint: FigureCreationPoint, newPoint: Point) {
        figureCreationPoint.snapFigure = this.protractr.sketch.getClosestFigure(newPoint);
        if (figureCreationPoint.snapFigure) {
            figureCreationPoint.point = figureCreationPoint.snapFigure.getClosestPoint(newPoint);
        } else {
            figureCreationPoint.point = newPoint.copy();
        }
    }

    constrainBySnap(figure: Figure, snapFigure: Figure) {
        if (!snapFigure) return;
        if (figure.type == "point") {
            let point = (figure as PointFigure).p;
            let vp = point.variablePoint;
            if (snapFigure.type == "point") {
                let v1 = (snapFigure as PointFigure).p.variablePoint;
                let ex = new EqualConstraint([v1.x, vp.x], "vertical");
                let ey = new EqualConstraint([v1.y, vp.y], "horizontal");
                this.protractr.sketch.addConstraints([ex, ey])
            } else if (snapFigure.type == "circle") {
                let r = (snapFigure as CircleFigure).r;
                let c = (snapFigure as CircleFigure).c.variablePoint;
                this.protractr.sketch.addConstraints([new ArcPointCoincidentConstraint(c, r, [vp])]);
            } else if (snapFigure.type == "line") {
                let p1 = (snapFigure as LineFigure).p1;
                let p2 = (snapFigure as LineFigure).p2;
                let midpoint = Point.averagePoint(p1, p2);
                if (midpoint.distTo(point) < 5 / this.protractr.ui.sketchView.ctxScale) {
                    this.protractr.sketch.addConstraints([new MidpointConstraint(p1.variablePoint, p2.variablePoint, vp)]);
                } else {
                    this.protractr.sketch.addConstraints([new ColinearPointsConstraint([p1.variablePoint, p2.variablePoint, vp])]);
                }
            }
        } else if (figure.type == "circle") {
            let circleFigure = (figure as CircleFigure);
            if (snapFigure.type == "point") {
                let r = circleFigure.r;
                let c = circleFigure.c.variablePoint;
                let p = (snapFigure as PointFigure).p.variablePoint;
                this.protractr.sketch.addConstraints([new ArcPointCoincidentConstraint(c, r, [p])]);
            }
        }
    }

    abstract addFigure();
}