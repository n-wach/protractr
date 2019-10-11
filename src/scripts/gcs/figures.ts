export class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    set(p: Point) {
        this.x = p.x;
        this.y = p.y;
    }
    copy() {
        return new Point(this.x, this.y);
    }
    distTo(o: Point) {
        return Math.sqrt(this.distTo2(o));
    }
    distTo2(o: Point) {
        let dx = o.x - this.x;
        let dy = o.y - this.y;
        return dx * dx + dy * dy;
    }
    normalizeSelf() {
        let length = this.distTo(ORIGIN);
        this.x /= length;
        this.y /= length;
    }
    pointTowards(target: Point, dist: number) {
        let diff = new Point(target.x - this.x, target.y - this.y);
        diff.normalizeSelf();
        return new Point(this.x + diff.x * dist, this.y + diff.y * dist);
    }
    equals(o: Point) {
        return o.x == this.x && o.y == this.y;
    }
}


let ORIGIN = new Point(0, 0);

export class PointFigure implements Figure {
    type = "point";
    p: Point;
    constructor(p: Point) {
        this.p = p;
    }
    getClosestPoint(point: Point): Point {
        return this.p.copy();
    }
}

export class LineFigure implements Figure {
    type = "line";
    p1: Point;
    p2: Point;
    constructor(p1: Point, p2: Point) {
        this.p1 = p1;
        this.p2 = p2;
    }
    projectionFactor(point: Point) {
        if(this.p1.equals(point)) return 0;
        if(this.p2.equals(point)) return 1;
        let dx = this.p1.x - this.p2.x;
        let dy = this.p1.y - this.p2.y;
        let len2 = dx * dx + dy * dy;
        return -((point.x - this.p1.x) * dx + (point.y - this.p1.y) * dy) / len2;
    }
    segmentFraction(point: Point) {
        let segFrac = this.projectionFactor(point);
        if (segFrac < 0) return 0;
        if (segFrac > 1 || isNaN(segFrac)) return 1;
        return segFrac;
    }
    project(point: Point) {
        let r = this.segmentFraction(point);
        let px = this.p1.x + r * (this.p2.x - this.p1.x);
        let py = this.p1.y + r * (this.p2.y - this.p1.y);
        return new Point(px, py);
    }
    getClosestPoint(point: Point): Point {
        return this.project(point);
    }
}

export class CircleFigure implements Figure {
    type = "circle";
    c: Point;
    r: number;
    constructor(c: Point, r: number) {
        this.c = c;
        this.r = r;
    }
    getClosestPoint(point: Point): Point {
        let dist = point.distTo(this.c);
        let radDist = Math.abs(dist - this.r);
        if(dist < radDist) {
            return this.c.copy();
        } else {
            return this.c.pointTowards(point, this.r);
        }
    }
}

export interface Figure {
    type: string;
    getClosestPoint(point: Point): Point;
}