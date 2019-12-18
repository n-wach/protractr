import {PointFigure} from "../../gcs/figures";
import {SketchView} from "../sketchview";
import ToolCreateFigure from "./toolCreateFigure";

export default class ToolCreatePoint extends ToolCreateFigure {
    addFigure() {
        let p = this.points[0].point;
        let pointFigure = new PointFigure(p);
        this.constrainBySnap(pointFigure, this.points[0].snapFigure);
        this.protractr.sketch.rootFigures.push(pointFigure);
    }

    draw(sketchView: SketchView) {
        if(this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
    }
}
