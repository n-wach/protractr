/**
 * @module gcs/geometry
 */
/** */
import Point from "./point";
import Variable from "../variable";
import Figure from "./figure";
import Util from "./util";

export default class Circle extends Figure {
    c: Point;
    _r: Variable;
    _constant: boolean;

    constructor(c: Point, r: number) {
        super();
        this.c = c.copy();
        this._r = new Variable(r);
    }

    setConstant(c: boolean) {
        this.c.constant = c;
        this._r.constant = c;
    }

    get r() {
        return this._r.v;
    }

    set r(v: number) {
        this._r.v = Math.max(v, 0);
    }

    equals(other: Figure) {
        if(!(other instanceof Circle)) return false;
        return other.c.equals(this.c) && other.r == this.r;
    }

    getChildFigures(): Figure[] {
        return [this.c];
    }

    getClosestPoint(point: Point): Point {
        return Util.projectOntoCircle(this, point);
    }

    translate(from: Point, to: Point) {
        this.r = Util.distanceBetweenPoints(to, this.c);
    }

    copy(): Circle {
        return new Circle(this.c.copy(), this.r);
    }
}
