/**
 * @module gcs/geometry
 */
/** */
import Point from "./point";

export default abstract class Figure {
    _constant: boolean;
    abstract getClosestPoint(point: Point): Point;
    abstract getChildFigures(): Figure[];
    abstract translate(from: Point, to: Point);
    abstract setConstant(c: boolean);
    get constant() {
        return this._constant;
    }
    set constant(b: boolean) {
        this.setConstant(b);
        this._constant = b;
    }
    abstract equals(other: Figure);
    abstract copy(): Figure;
}

