import {Variable, VariablePoint} from "./constraint";
import {EPSILON, protractr} from "../main";

export class Point {
    variablePoint: VariablePoint;
    get x() {
        return this.variablePoint.x.value;
    }
    get y() {
        return this.variablePoint.y.value;
    }
    set x(v: number) {
        this.variablePoint.x.value = v;
    }
    set y(v: number) {
        this.variablePoint.y.value = v;
    }
    constructor(x: number, y: number) {
        this.variablePoint = new VariablePoint(x, y);
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
        let length = this.distTo(new Point(0, 0));
        if(length == 0) {
            this.x = 0;
            this.y = 1;
            return this;
        }
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
    projectBetween(p1: Point, p2: Point, cutoff: boolean = false) {
        let r = cutoff ? this.segmentFractionBetween(p1, p2) : this.projectionFactorBetween(p1, p2);
        let px = p1.x + r * (p2.x - p1.x);
        let py = p1.y + r * (p2.y - p1.y);
        return new Point(px, py);
    }
    projectionFactorBetween(p1: Point, p2: Point) {
        if(p1.equals(this)) return 0;
        if(p2.equals(this)) return 1;
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        let len2 = dx * dx + dy * dy;
        return -((this.x - p1.x) * dx + (this.y - p1.y) * dy) / len2;
    }
    segmentFractionBetween(p1: Point, p2: Point) {
        let segFrac = this.projectionFactorBetween(p1, p2);
        if (segFrac < 0) return 0;
        if (segFrac > 1 || isNaN(segFrac)) return 1;
        return segFrac;
    }
}


export interface Figure {
    type: string;
    name: string;
    parentFigure: Figure;
    childFigures: Figure[];
    getClosestPoint(point: Point): Point;
    getRelatedFigures(): Figure[];
    getDescendants(): Figure[];
    getRootFigure(): Figure;
    translate(from: Point, to: Point);
    setLocked(lock: boolean);
}

export class BasicFigure implements Figure {
    childFigures: Figure[];
    parentFigure: Figure;
    type: string;
    name: string;

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
    setLocked(lock: boolean) {
        for(let fig of this.childFigures) {
            fig.setLocked(lock);
        }
    }
}

export class PointFigure extends BasicFigure {
    type = "point";
    name = "point";
    p: Point;
    childFigures: Figure[] = [];
    parentFigure: Figure = null;

    constructor(p: Point, name: string="point") {
        super();
        this.p = p;
        this.name = name;
        protractr.sketch.addVariable(this.p.variablePoint.x);
        protractr.sketch.addVariable(this.p.variablePoint.y);
    }
    getClosestPoint(point: Point): Point {
        return this.p.copy();
    }
    translate(from: Point, to: Point) {
        this.p.set(to);
    }
    setLocked(lock: boolean) {
        super.setLocked(lock);
        this.p.variablePoint.x.constant = lock;
        this.p.variablePoint.y.constant = lock;
    }
}

export class LineFigure extends BasicFigure {
    type = "line";
    name = "line"
    p1: Point;
    p2: Point;
    childFigures: Figure[];
    parentFigure: Figure;

    constructor(p1: Point, p2: Point, name: string = "line") {
        super();
        this.p1 = p1;
        this.p2 = p2;
        this.name = name;
        this.childFigures = [new PointFigure(this.p1, "p1"), new PointFigure(this.p2, "p2")];
        this.childFigures[0].parentFigure = this;
        this.childFigures[1].parentFigure = this;
    }
    getClosestPoint(point: Point): Point {
        return point.projectBetween(this.p1, this.p2, true);
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
    r: Variable;
    childFigures: Figure[];
    parentFigure: Figure;

    constructor(c: Point, r: number, name: string = "circle") {
        super();
        this.c = c;
        this.r = new Variable(r);
        this.name = name;
        protractr.sketch.addVariable(this.r);
        this.childFigures = [new PointFigure(this.c, "center")];
        this.childFigures[0].parentFigure = this;
    }
    getClosestPoint(point: Point): Point {
        return this.c.pointTowards(point, this.r.value);
    }
    translate(from: Point, to: Point) {
        this.r.value = to.distTo(this.c);
    }
    setLocked(lock: boolean) {
        super.setLocked(lock);
        this.r.constant = lock;
    }
}

export function getFullName(figure: Figure): string {
    if(!figure) return "null";
    let name = figure.name;
    while(figure.parentFigure) {
        figure = figure.parentFigure;
        name += " of " + figure.name;
    }
    return name;
}
