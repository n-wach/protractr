/**
 * @module ui/tools
 * @preferred
 */
/** */

import Protractr from "../../protractr";
import {Point} from "../../gcs/figures";
import {SketchView} from "../sketchview";

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
