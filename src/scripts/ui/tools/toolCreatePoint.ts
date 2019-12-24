/**
 * @module ui/tools
 */
/** */

import SketchView from "../sketchview";
import ToolCreateFigure from "./toolCreateFigure";
import Protractr from "../../protractr";

export default class ToolCreatePoint extends ToolCreateFigure {
    constructor(protractr: Protractr) {
        super(protractr, 1);
    }

    addFigure() {
        let point = this.points[0].point.copy();
        this.addRelationsBySnap(point, this.points[0].snapFigure);
        this.protractr.sketch.addFigure(point);
    }

    draw(sketchView: SketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
    }
}
