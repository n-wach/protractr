/**
 * @module gcs/geometry
 */
/** */

import Variable from "../variable";
import Figure from "./figure";

export default class Point extends Figure {
    _x: Variable;
    _y: Variable;
    constructor(x: number, y: number) {
        super();
        this._x = new Variable(x);
        this._y = new Variable(y);
    }

    get x() {
        return this._x.v;
    }

    set x(v: number) {
        this._x.v = v;
    }

    get y() {
        return this._y.v;
    }

    set y(v: number) {
        this._y.v = v;
    }

    getChildFigures(): Figure[] {
        return [];
    }

    getClosestPoint(point: Point): Point {
        return this.copy();
    }

    setConstant(c: boolean) {
        this._x.constant = c;
        this._y.constant = c;
    }

    translate(from: Point, to: Point) {
        this.x = to.x;
        this.y = to.y;
    }

    equals(other: Figure) {
        if(!(other instanceof Point)) return false;
        return other.x == this.x && other.y == this.y;
    }

    copy(): Point {
        return new Point(this.x, this.y);
    }
}