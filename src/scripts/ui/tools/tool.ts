/**
 * @module ui/tools
 * @preferred
 */
/** */

import Protractr from "../../protractr";
import SketchView from "../sketchview";
import Point from "../../gcs/geometry/point";

export default abstract class Tool {
    protractr: Protractr;

    constructor(protractr: Protractr) {
        this.protractr = protractr;
        this.reset();
    }

    abstract down(point: Point);

    abstract up(point: Point);

    abstract move(point: Point);

    abstract draw(sketchView: SketchView);

    abstract reset();
}
