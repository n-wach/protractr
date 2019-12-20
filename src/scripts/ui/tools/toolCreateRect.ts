import ToolCreateFigure from "./toolCreateFigure";
import {SketchView} from "../sketchview";
import {LineFigure, Point} from "../../gcs/figures";
import {EqualConstraint} from "../../gcs/constraint";
import {Protractr} from "../../protractr";

export default class ToolCreateRect extends ToolCreateFigure {
    constructor(protractr: Protractr) {
        super(protractr, 2);
    }

    addFigure() {
        let p0 = this.points[0].point;
        let p2 = this.points[1].point;
        let p1 = new Point(p2.x, p0.y);
        let p3 = new Point(p0.x, p2.y);

        let h0 = new LineFigure(p0.copy(), p1.copy());
        let v0 = new LineFigure(p1.copy(), p2.copy());
        let h1 = new LineFigure(p2.copy(), p3.copy());
        let v1 = new LineFigure(p3.copy(), p0.copy());

        this.protractr.sketch.rootFigures.push(h0, h1, v0, v1);

        let hc0 = new EqualConstraint([h0.p1.variablePoint.y, h0.p2.variablePoint.y, v0.p1.variablePoint.y, v1.p2.variablePoint.y], "horizontal");
        let hc1 = new EqualConstraint([h1.p1.variablePoint.y, h1.p2.variablePoint.y, v1.p1.variablePoint.y, v0.p2.variablePoint.y], "horizontal");
        let vc0 = new EqualConstraint([v0.p1.variablePoint.x, v0.p2.variablePoint.x, h0.p2.variablePoint.x, h1.p1.variablePoint.x], "vertical");
        let vc1 = new EqualConstraint([v1.p1.variablePoint.x, v1.p2.variablePoint.x, h0.p1.variablePoint.x, h1.p2.variablePoint.x], "vertical");

        this.protractr.sketch.addConstraints([hc0, hc1, vc0, vc1]);

        this.constrainBySnap(h0.childFigures[0], this.points[0].snapFigure);
        this.constrainBySnap(v1.childFigures[1], this.points[0].snapFigure);

        this.constrainBySnap(h1.childFigures[0], this.points[1].snapFigure);
        this.constrainBySnap(v0.childFigures[1], this.points[1].snapFigure);
    }

    draw(sketchView: SketchView) {
        if(this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        } else {
            let p0 = this.points[0].point;
            let p2 = this.points[1].point;
            let p1 = new Point(p2.x, p0.y);
            let p3 = new Point(p0.x, p2.y);

            sketchView.drawPoint(p0);
            sketchView.drawPoint(p1);
            sketchView.drawPoint(p2);
            sketchView.drawPoint(p3);

            sketchView.drawLine(p0, p1);
            sketchView.drawLine(p1, p2);
            sketchView.drawLine(p2, p3);
            sketchView.drawLine(p3, p0);
        }
    }
}
