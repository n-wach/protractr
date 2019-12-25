/**
 * @module ui/tools
 * @preferred
 */
/** */

import Protractr from "../../protractr";
import SketchView from "../sketchview";
import Point from "../../gcs/geometry/point";
import Figure from "../../gcs/geometry/figure";

export default abstract class Tool {
    protractr: Protractr;

    constructor(protractr: Protractr) {
        this.protractr = protractr;
        this.reset();
    }

    getFigureNearPoint(point: Point): Figure {
        return this.protractr.sketch.getClosestFigure(point, this.protractr.ui.sketchView.ctxScale, 10);
    }

    abstract down(point: Point);

    abstract up(point: Point);

    abstract move(point: Point);

    abstract draw(sketchView: SketchView);

    abstract reset();
}
