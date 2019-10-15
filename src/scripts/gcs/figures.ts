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
        return this;
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
        return this;
    }
    pointTowards(target: Point, dist: number) {
        let diff = new Point(target.x - this.x, target.y - this.y);
        diff.normalizeSelf();
        return new Point(this.x + diff.x * dist, this.y + diff.y * dist);
    }
    equals(o: Point) {
        return o.x == this.x && o.y == this.y;
    }
    add(point: Point) {
        this.x += point.x;
        this.y += point.y;
        return this;
    }
    sub(point: Point) {
        this.x -= point.x;
        this.y -= point.y;
        return this;
    }
}

export interface Figure {
    type: string;
    parentFigure: Figure;
    childFigures: Figure[];
    getClosestPoint(point: Point): Point;
    getRelatedFigures(): Figure[];
    getDescendants(): Figure[];
    getRootFigure(): Figure;
    translate(from: Point, to: Point);
}

export class BasicFigure implements Figure {
    childFigures: Figure[];
    parentFigure: Figure;
    type: string;

    getClosestPoint(point: Point): Point {
        return undefined;
    }
    translate(from: Point, to: Point) {

    }
    getRelatedFigures(): Figure[] {
        return this.getRootFigure().getDescendants();
    }
    getRootFigure(): Figure {
        if(this.parentFigure) {
            return this.parentFigure.getRootFigure();
        } else {
            return (this as Figure);
        }
    }
    getDescendants(): Figure[] {
        let children = [(this as Figure)];
        for(let child of this.childFigures) {
            children.push(child);
            let descendants = child.getDescendants();
            for(let descendant of descendants) {
                children.push(descendant);
            }
        }
        return children;
    }
}

let ORIGIN = new Point(0, 0);

export class PointFigure extends BasicFigure {
    type = "point";
    p: Point;
    childFigures: Figure[] = [];
    parentFigure: Figure = null;

    constructor(p: Point, name: string="point") {
        super();
        this.p = p;
    }
    getClosestPoint(point: Point): Point {
        return this.p.copy();
    }
    translate(from: Point, to: Point) {
        this.p.set(to);
    }
}

export class LineFigure extends BasicFigure {
    type = "line";
    p1: Point;
    p2: Point;
    childFigures: Figure[];
    parentFigure: Figure;

    constructor(p1: Point, p2: Point) {
        super();
        this.p1 = p1;
        this.p2 = p2;
        this.childFigures = [new PointFigure(this.p1, "p1"), new PointFigure(this.p2, "p2")];
        this.childFigures[0].parentFigure = this;
        this.childFigures[1].parentFigure = this;
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
    translate(from: Point, to: Point) {
        let diff = to.sub(from).copy();
        this.p1.add(diff);
        this.p2.add(diff);
    }
}

export class CircleFigure extends BasicFigure {
    type = "circle";
    c: Point;
    r: number;
    childFigures: Figure[];
    parentFigure: Figure;

    constructor(c: Point, r: number) {
        super();
        this.c = c;
        this.r = r;
        this.childFigures = [new PointFigure(this.c, "center")];
        this.childFigures[0].parentFigure = this;
    }
    getClosestPoint(point: Point): Point {
        return this.c.pointTowards(point, this.r);
    }
    translate(from: Point, to: Point) {
        this.r = to.distTo(this.c);
    }
}
