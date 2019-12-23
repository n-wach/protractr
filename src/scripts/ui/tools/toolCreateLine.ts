/**
 * @module ui/tools
 */
/** */

import ToolCreateFigure from "./toolCreateFigure";
import Protractr from "../../protractr";
import SketchView from "../sketchview";
import Line from "../../gcs/geometry/line";

export default class ToolCreateLine extends ToolCreateFigure {
    constructor(protractr: Protractr) {
        super(protractr, 2);
    }

    addFigure() {
        let line = new Line(this.points[0].point, this.points[1].point);
        this.addRelationsBySnap(line.p0, this.points[0].snapFigure);
        this.addRelationsBySnap(line.p1, this.points[1].snapFigure);
        this.protractr.sketch.addFigure(line);
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
