/**
 * @module ui/tools
 */
/** */

import ToolCreateFigure from "./toolCreateFigure";
import SketchView from "../sketchview";
import Protractr from "../../protractr";
import Circle from "../../gcs/geometry/circle";
import Util from "../../gcs/geometry/util";

export default class ToolCreateCircle extends ToolCreateFigure {
    constructor(protractr: Protractr) {
        super(protractr, 2);
    }

    addFigure() {
        let center = this.points[0].point;
        let radius = Util.distanceBetweenPoints(center, this.points[1].point);
        let circle = new Circle(center, radius);
        this.addRelationsBySnap(circle.c, this.points[0].snapFigure);
        this.addRelationsBySnap(circle, this.points[1].snapFigure);
        this.protractr.sketch.addFigure(circle);
    }

    draw(sketchView: SketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        } else {
            let center = this.points[0].point;
            sketchView.drawPoint(center);
            let radius = Util.distanceBetweenPoints(center, this.currentPoint.point);
            sketchView.drawCircle(center, radius);
        }
    }
}
