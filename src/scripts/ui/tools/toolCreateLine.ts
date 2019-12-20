import ToolCreateFigure from "./toolCreateFigure";
import {SketchView} from "../sketchview";
import {LineFigure} from "../../gcs/figures";
import {Protractr} from "../../protractr";

export default class ToolCreateLine extends ToolCreateFigure {
    constructor(protractr: Protractr) {
        super(protractr, 2);
    }

    addFigure() {
        let p0 = this.points[0].point;
        let p1 = this.points[1].point;
        let lineFigure = new LineFigure(p0, p1);
        this.constrainBySnap(lineFigure.childFigures[0], this.points[0].snapFigure);
        this.constrainBySnap(lineFigure.childFigures[1], this.points[1].snapFigure);
        this.protractr.sketch.rootFigures.push(lineFigure);
    }

    draw(sketchView: SketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        } else {
            let p0 = this.points[0].point;
            let p1 = this.points[1].point;
            sketchView.drawPoint(p0);
            sketchView.drawPoint(p1);
            sketchView.drawLine(p0, p1);
        }
    }
}
