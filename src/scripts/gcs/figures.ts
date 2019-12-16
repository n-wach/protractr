import {Variable, VariablePoint} from "./constraint";
import {protractr} from "../main";
import {FigureExport, Sketch, SketchExport} from "./sketch";

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
    set(p: Point): Point {
        this.x = p.x;
        this.y = p.y;
        return this;
    }
    copy(): Point {
        return new Point(this.x, this.y);
    }
    distTo(o: Point): number {
        return Math.sqrt(this.distTo2(o));
    }
    distTo2(o: Point): number {
        let dx = o.x - this.x;
        let dy = o.y - this.y;
        return dx * dx + dy * dy;
    }
    normalizeSelf(): Point {
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
    pointTowards(target: Point, dist: number): Point {
        let diff = new Point(target.x - this.x, target.y - this.y);
        diff.normalizeSelf();
        return new Point(this.x + diff.x * dist, this.y + diff.y * dist);
    }
    equals(o: Point): boolean {
        return o.x == this.x && o.y == this.y;
    }
    add(point: Point): Point {
        this.x += point.x;
        this.y += point.y;
        return this;
    }
    sub(point: Point): Point {
        this.x -= point.x;
        this.y -= point.y;
        return this;
    }
    projectBetween(p1: Point, p2: Point, cutoff: boolean = false): Point {
        let r = cutoff ? this.segmentFractionBetween(p1, p2) : this.projectionFactorBetween(p1, p2);
        let px = p1.x + r * (p2.x - p1.x);
        let py = p1.y + r * (p2.y - p1.y);
        return new Point(px, py);
    }
    projectionFactorBetween(p1: Point, p2: Point): number {
        if(p1.equals(this)) return 0;
        if(p2.equals(this)) return 1;
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        let len2 = dx * dx + dy * dy;
        return -((this.x - p1.x) * dx + (this.y - p1.y) * dy) / len2;
    }
    segmentFractionBetween(p1: Point, p2: Point): number {
        let segFrac = this.projectionFactorBetween(p1, p2);
        if (segFrac < 0) return 0;
        if (segFrac > 1 || isNaN(segFrac)) return 1;
        return segFrac;
    }

    /**
     * Determine if three points are clockwise (1), counterclockwise(-1) or colinear(0)
     * @param p1
     * @param p2
     * @param p3
     */
    static orientation(p1: Point, p2: Point, p3: Point): number {
        let val = (p2.y - p1.y) * (p3.x - p2.x) -
                  (p2.x - p1.x) * (p3.y - p2.y);

        if (Math.abs(val) < 0.1) return 0;  // colinear

        return (val > 0) ? 1 : -1; // clock or counterclock wise
    }

    /**
     * Determine if p1 lies on the line between p2 and p3
     * @param p1
     * @param p2
     * @param p3
     */
    static onSegment(p1: Point, p2: Point, p3: Point) {
            return (p2.x <= Math.max(p1.x, p3.x) && p2.x >= Math.min(p1.x, p3.x) &&
                p2.y <= Math.max(p1.y, p3.y) && p2.y >= Math.min(p1.y, p3.y));
    }

    /**
     * Returns true of the line p1q1 intersects q2p2
     * @param p1
     * @param p2
     * @param p3
     * @param p4
     */
    static doIntersect(p1: Point, q1: Point, p2: Point, q2: Point) {
        let o1 = Point.orientation(p1, q1, p2);
        let o2 = Point.orientation(p1, q1, q2);
        let o3 = Point.orientation(p2, q2, p1);
        let o4 = Point.orientation(p2, q2, q1);
        //General case
        if (o1 != o2 && o3 != o4) return true;

        // Special Cases
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1
        if (o1 == 0 && Point.onSegment(p1, p2, q1)) return true;

        // p1, q1 and q2 are colinear and q2 lies on segment p1q1
        if (o2 == 0 && Point.onSegment(p1, q2, q1)) return true;

        // p2, q2 and p1 are colinear and p1 lies on segment p2q2
        if (o3 == 0 && Point.onSegment(p2, p1, q2)) return true;

        // p2, q2 and q1 are colinear and q1 lies on segment p2q2
        if (o4 == 0 && Point.onSegment(p2, q1, q2)) return true;

        return false; // Doesn't fall in any of the above cases

    }
    static fromVariablePoint(v: VariablePoint): Point {
        let p = new Point(0, 0);
        p.variablePoint = v;
        return p;
    }

    static averagePoint(...points: Point[]) {
        let x = 0;
        let y = 0;
        for(let point of points) {
            x += point.x;
            y += point.y;
        }
        return new Point(x / points.length, y / points.length);
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
    asObject(obj: SketchExport, sketch: Sketch): FigureExport;
}

export class BasicFigure implements Figure {
    childFigures: Figure[];
    parentFigure: Figure;
    type: string = "null";
    name: string = "null";

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
    asObject(obj: SketchExport, sketch: Sketch): FigureExport {
        return {
            "type": this.type,
        };
    }
}

export class PointFigure extends BasicFigure {
    type = "point";
    name = "point";
    p: Point;
    childFigures: Figure[] = [];
    parentFigure: Figure = null;

    constructor(p: Point, name: string="point", add=true) {
        super();
        this.p = p;
        this.name = name;
        if(add) protractr.sketch.addPoint(this.p.variablePoint);
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
    asObject(obj: SketchExport, sketch: Sketch): FigureExport {
        let o = super.asObject(obj, sketch);
        o["p"] = sketch.points.indexOf(this.p.variablePoint);
        return o;
    }
}

export class LineFigure extends BasicFigure {
    type = "line";
    name = "line"
    p1: Point;
    p2: Point;
    childFigures: Figure[];
    parentFigure: Figure;

    constructor(p1: Point, p2: Point, name: string = "line", add=true) {
        super();
        this.p1 = p1;
        this.p2 = p2;
        this.name = name;
        this.childFigures = [new PointFigure(this.p1, "p1", add), new PointFigure(this.p2, "p2", add)];
        this.childFigures[0].parentFigure = this;
        this.childFigures[1].parentFigure = this;
    }
    getClosestPoint(point: Point): Point {
        let projection = point.projectBetween(this.p1, this.p2, true);

        let midpoint = Point.averagePoint(this.p1, this.p2);
        if(midpoint.distTo(point) < 5 / protractr.ui.sketchView.ctxScale) {
            return midpoint;
        }
        return projection;
    }
    translate(from: Point, to: Point) {
        let diff = to.sub(from).copy();
        this.p1.add(diff);
        this.p2.add(diff);
    }
    asObject(obj: SketchExport, sketch: Sketch): FigureExport {
        let o = super.asObject(obj, sketch);
        o["p1"] = sketch.points.indexOf(this.p1.variablePoint);
        o["p2"] = sketch.points.indexOf(this.p2.variablePoint);
        return o;
    }
}

export class CircleFigure extends BasicFigure {
    type = "circle";
    c: Point;
    r: Variable;
    childFigures: Figure[];
    parentFigure: Figure;

    constructor(c: Point, r: number, name: string = "circle", add=true) {
        super();
        this.c = c;
        this.r = new Variable(r);
        this.name = name;
        if(add) protractr.sketch.addVariable(this.r);
        this.childFigures = [new PointFigure(this.c, "center", add)];
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
    asObject(obj: SketchExport, sketch: Sketch): FigureExport {
        let o = super.asObject(obj, sketch);
        o["c"] = sketch.points.indexOf(this.c.variablePoint);
        o["r"] = sketch.variables.indexOf(this.r);
        return o;
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

export function figureFromObject(obj: FigureExport, sketch: Sketch): Figure {
    switch(obj.type) {
        case "point":
            let p = sketch.points[obj["p"]];
            return new PointFigure(Point.fromVariablePoint(p), "point", false);
        case "line":
            let p1 = sketch.points[obj["p1"]];
            let p2 = sketch.points[obj["p2"]];
            return new LineFigure(Point.fromVariablePoint(p1), Point.fromVariablePoint(p2), "line",false);
        case "circle":
            let c = sketch.points[obj["c"]];
            let r = sketch.variables[obj["r"]];
            let circle = new CircleFigure(Point.fromVariablePoint(c), 0, "circle", false);
            circle.r = r;
            return circle;
    }
    return null;
}
