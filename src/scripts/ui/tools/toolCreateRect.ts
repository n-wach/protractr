/**
 * @module ui/tools
 */
/** */

import ToolCreateFigure from "./toolCreateFigure";
import Protractr from "../../protractr";
import Point from "../../gcs/geometry/point";
import Line from "../../gcs/geometry/line";
import RelationEqual from "../../gcs/relations/relationEqual";
import SketchView from "../sketchview";

export default class ToolCreateRect extends ToolCreateFigure {
    constructor(protractr: Protractr) {
        super(protractr, 2);
    }

    addFigure() {
        let p0 = this.points[0].point;
        let p2 = this.points[1].point;
        let p1 = new Point(p2.x, p0.y);
        let p3 = new Point(p0.x, p2.y);

        let h0 = new Line(p0, p1);
        let v0 = new Line(p1, p2);
        let h1 = new Line(p2, p3);
        let v1 = new Line(p3, p0);

        let hc0 = new RelationEqual(h0.p0._y, h0.p1._y, v0.p0._y, v1.p1._y);
        let hc1 = new RelationEqual(h1.p0._y, h1.p1._y, v0.p1._y, v1.p0._y);
        let vc0 = new RelationEqual(v0.p0._x, v0.p1._x, h0.p1._x, h1.p0._x);
        let vc1 = new RelationEqual(v1.p0._x, v1.p1._x, h0.p0._x, h1.p1._x);

        this.protractr.sketch.relationManager.addRelations(hc0, hc1, vc0, vc1);

        this.addRelationsBySnap(h0.p0, this.points[0].snapFigure);
        this.addRelationsBySnap(v1.p1, this.points[0].snapFigure);

        this.addRelationsBySnap(h1.p0, this.points[1].snapFigure);
        this.addRelationsBySnap(v0.p1, this.points[1].snapFigure);

        this.protractr.sketch.addFigures(h0, h1, v0, v1);
    }

    draw(sketchView: SketchView) {
        if (this.points.length == 1) {
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
