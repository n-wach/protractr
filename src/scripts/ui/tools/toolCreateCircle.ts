import ToolCreateFigure from "./toolCreateFigure";
import {SketchView} from "../sketchview";
import {CircleFigure} from "../../gcs/figures";

export default class ToolCreateCircle extends ToolCreateFigure {
    addFigure() {
        let center = this.points[0].point;
        let radius = center.distTo(this.points[1].point);
        let circleFigure = new CircleFigure(center, radius);
        this.constrainBySnap(circleFigure.childFigures[0], this.points[0].snapFigure);
        this.constrainBySnap(circleFigure, this.points[1].snapFigure);
        this.protractr.sketch.rootFigures.push(circleFigure);
    }

    draw(sketchView: SketchView) {
        if(this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        } else {
            let center = this.points[0].point;
            sketchView.drawPoint(this.points[0].point);
            let radius = center.distTo(this.currentPoint.point);
            sketchView.drawCircle(center, radius);
        }
    }
}
