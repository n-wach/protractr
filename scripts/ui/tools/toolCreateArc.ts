/**
 * @module ui/tools
 */
/** */

import ToolCreateFigure from "./toolCreateFigure";
import SketchView from "../sketchview";
import Protractr from "../../protractr";
import Circle from "../../gcs/geometry/circle";
import Util from "../../gcs/geometry/util";
import Arc from "../../gcs/geometry/arc";
import RelationPointsOnCircle from "../../gcs/relations/relationPointsOnCircle";

export default class ToolCreateArc extends ToolCreateFigure {
    constructor(protractr: Protractr) {
        super(protractr, 3);
    }

    addFigure() {
        let center = this.points[0].point;
        let radius = Util.distanceBetweenPoints(center, this.points[1].point);
        let a0 = Util.getAngleBetween(center, this.points[1].point);
        let a1 = Util.getAngleBetween(center, this.points[2].point);

        let arc = new Arc(center, radius, a0, a1);
        this.addRelationsBySnap(arc.c, this.points[0].snapFigure);
        this.addRelationsBySnap(arc.p0, this.points[1].snapFigure);
        this.addRelationsBySnap(arc.p1, this.points[2].snapFigure);

        this.protractr.sketch.addFigure(arc);
    }

    draw(sketchView: SketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        } else if (this.points.length == 2) {
            let center = this.points[0].point;
            sketchView.drawPoint(center);
            let radius = Util.distanceBetweenPoints(center, this.currentPoint.point);
            sketchView.drawCircle(center, radius);
            sketchView.drawPoint(this.currentPoint.point);
        } else {
            let center = this.points[0].point;
            let p0 = this.points[1].point;
            let radius = Util.distanceBetweenPoints(center, p0);

            let p1 = Util.pointInDirection(center, this.currentPoint.point, radius);
            sketchView.drawPoint(center);
            sketchView.drawPoint(p0);
            sketchView.drawPoint(p1);

            let a0 = Util.getAngleBetween(center, p0);
            let a1 = Util.getAngleBetween(center, p1);
            sketchView.drawArc(center, radius, a0, a1);
        }
    }
}
