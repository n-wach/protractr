/**
 * @module gcs/geometry
 */
/** */
import Figure from "./figure";
import Point from "./point";
import Util from "./util";

export default class Line extends Figure {
    p0: Point;
    p1: Point;
    _constant: boolean;
    constructor(p0: Point, p1: Point) {
        super();
        this.p0 = p0.copy();
        this.p1 = p1.copy();
    }

    getChildFigures(): Figure[] {
        return [this.p0, this.p1];
    }

    getClosestPoint(point) {
        return Util.projectSegment(this, point);
    }

    setConstant(c: boolean) {
        this.p0.constant = c;
        this.p1.constant = c;
    }

    translate(from, to) {
        let dx = to.x - from.x;
        let dy = to.y - from.y;
        this.p0.x += dx;
        this.p0.y += dy;
        this.p1.x += dx;
        this.p1.y += dy;
    }

    equals(other: Figure) {
        if(!(other instanceof Line)) return false;
        return other.p0.equals(this.p0) && other.p1.equals(this.p1);
    }

    copy(): Figure {
        return new Line(this.p0.copy(), this.p1.copy());
    }

}