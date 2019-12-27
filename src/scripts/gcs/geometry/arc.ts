/**
 * @module gcs/geometry
 */
/** */
import Point from "./point";
import Figure from "./figure";
import Util from "./util";
import Circle from "./circle";

export default class Arc extends Circle {
    _constant: boolean;
    p0: ArcPoint;
    p1: ArcPoint;

    constructor(c: Point, r: number, a0: number, a1: number) {
        super(c, r);
        let p0 = Util.pointAtAngle(c, r, a0);
        this.p0 = new ArcPoint(this, p0.x, p0.y);

        let p1 = Util.pointAtAngle(c, r, a1);
        this.p1 = new ArcPoint(this, p1.x, p1.y);
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

        let p0 = Util.pointInDirection(this.c, this.p0, this.r);
        this.p0.x = p0.x;
        this.p0.y = p0.y;

        let p1 = Util.pointInDirection(this.c, this.p1, this.r);
        this.p1.x = p1.x;
        this.p1.y = p1.y;
    }

    get angle0() {
        return Util.getAngleBetween(this.c, this.p0);
    }

    get angle1() {
        return Util.getAngleBetween(this.c, this.p1);
    }

    equals(other: Figure) {
        if(!(other instanceof Arc)) return false;
        return other.c.equals(this.c) && other.r == this.r &&
            other.angle0 == this.angle0 && other.angle1 == this.angle1;
    }

    getChildFigures(): Figure[] {
        return [this.c, this.p0, this.p1];
    }

    getClosestPoint(point: Point): Point {
        return Util.projectOntoArc(this, point);
    }

    translate(from: Point, to: Point) {
        this.r = Util.distanceBetweenPoints(to, this.c);
    }

    copy(): Arc {
        return new Arc(this.c.copy(), this.r, this.angle0, this.angle1);
    }
}

export class ArcPoint extends Point {
    arc: Arc;
    constructor(arc: Arc, x: number, y: number) {
        super(x, y);
        this.arc = arc;
    }
    translate(from: Point, to: Point) {
        super.translate(from, to);
        this.arc.r = Util.distanceBetweenPoints(this.arc.c, this);
    }
}