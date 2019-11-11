import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "./figures";
import {EPSILON} from "../main";
import {ConstraintExport, Sketch, SketchExport} from "./sketch";

export class Variable {
    _value: number;
    constant: boolean;
    get value() {
        return this._value;
    }
    set value(v: number) {
        if(!this.constant) this._value = v;
    }
    constructor(v: number) {
        this.value = v;
        this.constant = false;
    }
}

export class VariablePoint {
    x: Variable;
    y: Variable;
    constructor(x: number, y: number) {
        this.x = new Variable(x);
        this.y = new Variable(y);
    }
    toPoint(): Point {
        return new Point(this.x.value, this.y.value);
    }
    has(v: Variable): boolean {
        return this.x == v || this.y == v;
    }
    deltaVTowards(v: Variable, goal: Point) {
        if(this.x == v) return goal.x - v.value;
        if(this.y == v) return goal.y - v.value;
        return 0;
    }
    static fromVariables(x: Variable, y: Variable): VariablePoint {
        let v = new VariablePoint(0, 0);
        v.x = x;
        v.y = y;
        return v;
    }
}

function sum(vals: Variable[]): number {
    let sum = 0;
    for(let v of vals){
        sum += v.value;
    }
    return sum;
}

function equalGoal(vals: Variable[]): number {
    let sum = 0;
    for(let v of vals) {
        if(v.constant) return v._value;
        sum += v._value;
    }
    return sum / vals.length;
}

export interface Constraint {
    type: string;
    getError(): number;
    getGradient(v: Variable): number; //how to adjust v to reduce error
    containsFigure(f: Figure): boolean; // should a given figure be highlighted as a part of this constraint
    asObject(obj: SketchExport, sketch: Sketch): ConstraintExport;
}

export class EqualConstraint implements Constraint {
    type = "equal";
    variables: Variable[];
    constructor(vals: Variable[]) {
        this.variables = vals;
    }
    getError(): number {
        let error = 0;
        let avg = equalGoal(this.variables);
        for(let v of this.variables) {
            error += Math.abs(avg - v.value);
        }
        return error;
    }
    getGradient(v: Variable): number {
        if(this.variables.indexOf(v) == -1) return 0;
        let avg = equalGoal(this.variables);
        return avg - v.value;
    }
    containsFigure(f: Figure): boolean {
        if(f.type == "point") {
            for(let v of this.variables) {
                if((f as PointFigure).p.variablePoint.has(v)) return true;
            }
            return false;
        } else if (f.type == "line") {
            //both points
            return this.containsFigure(f.childFigures[0]) && this.containsFigure(f.childFigures[1]);
        } else if (f.type == "circle") {
            //just radius
            return this.variables.indexOf((f as CircleFigure).r) != -1;
        }
        return false;
    }

    asObject(obj: SketchExport, sketch: Sketch): ConstraintExport {
        let variables = [];
        for(let v of this.variables) {
            variables.push(sketch.variables.indexOf(v));
        }
        return {
            "type": this.type,
            "variables": variables
        };
    }

    static fromObject(c: ConstraintExport, sketch: Sketch): EqualConstraint {
        let variables = [];
        for(let v of c["variables"]) {
            variables.push(sketch.variables[v]);
        }
        return new EqualConstraint(variables);
    }
}

export class ArcPointCoincidentConstraint implements Constraint {
    type = "arc-point-coincident";
    center: VariablePoint;
    radius: Variable;
    points: VariablePoint[];
    constructor(center: VariablePoint, radius: Variable, points: VariablePoint[]) {
        this.center = center;
        this.radius = radius;
        this.points = points;
    }
    getError(): number {
        let error = 0;
        let center = this.center.toPoint();
        for(let p of this.points) {
            error += Math.abs(this.radius.value - p.toPoint().distTo(center));
        }
        return error;
    }
    getGradient(v: Variable): number {
        for(let p of this.points) {
            if(p.has(v)) {
                let center = this.center.toPoint();
                let target = p.toPoint()
                let goal = center.pointTowards(target, this.radius.value);
                return p.deltaVTowards(v, goal);
            }
        }
        if(v === this.radius) {
            let totalDist = 0;
            for(let p of this.points) {
                let dx = p.x.value - this.center.x.value;
                let dy = p.y.value - this.center.y.value;
                totalDist += Math.sqrt(dx * dx + dy * dy);
            }
            let averageRadius = totalDist / this.points.length;
            return averageRadius - v.value;
        }
        if(this.center.x == v) {
            let error = 0;
            for(let p of this.points) {
                let dist = this.center.toPoint().distTo(p.toPoint());
                if(dist == 0) continue;
                let dx = this.center.x.value - p.x.value;
                let d = this.radius.value / dist;
                error += (1 - d) * dx;
            }
            return -error;
        } else if (this.center.y == v) {
            let error = 0;
            for(let p of this.points) {
                let dist = this.center.toPoint().distTo(p.toPoint());
                if(dist == 0) continue;
                let dy = this.center.y.value - p.y.value;
                let d = this.radius.value / dist;
                error += (1 - d) * dy;
            }
            return -error;
        }
        return 0;
    }
    containsFigure(f: Figure): boolean {
        if(f.type == "point") {
            return this.points.indexOf((f as PointFigure).p.variablePoint) != -1;
        } else if (f.type == "circle") {
            //just radius
            return this.radius == (f as CircleFigure).r;
        }
        return false;
    }

    asObject(obj: SketchExport, sketch: Sketch): ConstraintExport {
        let points = [];
        for(let p of this.points) {
            points.push(sketch.points.indexOf(p));
        }
        return {
            "type": this.type,
            "c": sketch.points.indexOf(this.center),
            "r": sketch.variables.indexOf(this.radius),
            "points": points
        };
    }

    static fromObject(c: ConstraintExport, sketch: Sketch): ArcPointCoincidentConstraint {
        let ce = sketch.points[c["c"]];
        let r = sketch.variables[c["r"]];
        let points = [];
        for(let p of c["points"]) {
            points.push(sketch.points[p]);
        }
        return new ArcPointCoincidentConstraint(ce, r, points);
    }
}

export class MidpointConstraint implements Constraint {
    type = "midpoint";
    p1: VariablePoint;
    p2: VariablePoint;
    midpoint: VariablePoint;
    constructor(p1: VariablePoint, p2: VariablePoint, midpoint: VariablePoint) {
        this.p1 = p1;
        this.p2 = p2;
        this.midpoint = midpoint;
    }
    getError(): number {
        //distance between midpoint and average of two points
        let avgX = (this.p1.x.value + this.p2.x.value) / 2;
        let avgY = (this.p1.y.value + this.p2.y.value) / 2;
        let dx = this.midpoint.x.value - avgX;
        let dy = this.midpoint.y.value - avgY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    getGradient(v: Variable): number {
        if(v === this.midpoint.x) {
            let avgX = (this.p1.x.value + this.p2.x.value) / 2;
            return avgX - v.value;
        } else if (v === this.midpoint.y) {
            let avgY = (this.p1.y.value + this.p2.y.value) / 2;
            return avgY - v.value;
        } else if (this.p1.has(v)) {
            let p2 = this.p2.toPoint();
            let midpoint = this.midpoint.toPoint();
            let halfDist = p2.distTo(midpoint);
            let goalP1 = p2.pointTowards(midpoint, halfDist * 2);
            return this.p1.deltaVTowards(v, goalP1);
        } else if (this.p2.has(v)) {
            let p1 = this.p1.toPoint();
            let midpoint = this.midpoint.toPoint();
            let halfDist = p1.distTo(midpoint);
            let goalP2 = p1.pointTowards(midpoint, halfDist * 2);
            return this.p2.deltaVTowards(v, goalP2);
        }
        return 0;
    }
    containsFigure(f: Figure): boolean {
        if(f.type == "point") {
            return this.p1 == (f as PointFigure).p.variablePoint ||
                   this.p2 == (f as PointFigure).p.variablePoint ||
                   this.midpoint == (f as PointFigure).p.variablePoint;
        } else if (f.type == "line") {
            //both points
            return this.p1 == (f as LineFigure).p1.variablePoint && this.p2 == (f as LineFigure).p2.variablePoint;
        }
        return false;
    }
    asObject(obj: SketchExport, sketch: Sketch): ConstraintExport {
        return {
            "type": this.type,
            "p1": sketch.points.indexOf(this.p1),
            "p2": sketch.points.indexOf(this.p2),
            "mp": sketch.points.indexOf(this.midpoint)
        };
    }

    static fromObject(c: ConstraintExport, sketch: Sketch): MidpointConstraint {
        let p1 = sketch.points[c["p1"]];
        let p2 = sketch.points[c["p2"]];
        let mp = sketch.points[c["mp"]];
        return new MidpointConstraint(p1, p2, mp);
    }
}

export class ColinearPointsConstraint implements Constraint {
    type = "colinear";
    points: VariablePoint[];

    constructor(points: VariablePoint[]) {
        this.points = points;
    }
    getError(): number {
        let regression = leastSquaresRegression(this.points);
        let error = 0;
        for(let point of this.points) {
            let p = point.toPoint();
            let regressed = p.projectBetween(regression[0], regression[1]);
            error += p.distTo(regressed);
        }
        return error;
    }
    getGradient(v: Variable): number {
        for(let point of this.points) {
            if(point.has(v)) {
                let regression = leastSquaresRegression(this.points);
                let p = point.toPoint();
                let regressed = p.projectBetween(regression[0], regression[1]);
                return point.deltaVTowards(v, regressed);
            }
        }
        return 0;
    }
    containsFigure(f: Figure): boolean {
        if(f.type == "point") {
            return this.points.indexOf((f as PointFigure).p.variablePoint) != -1;
        } else if (f.type == "line") {
            //both points
            return this.containsFigure(f.childFigures[0]) && this.containsFigure(f.childFigures[1]);
        }
        return false;
    }

    asObject(obj: SketchExport, sketch: Sketch): ConstraintExport {
        let points = [];
        for(let p of this.points) {
            points.push(sketch.points.indexOf(p));
        }
        return {
            "type": this.type,
            "points": points
        };
    }
    static fromObject(c: ConstraintExport, sketch: Sketch): ColinearPointsConstraint {
        let points = [];
        for(let p of c["points"]) {
            points.push(sketch.points[p]);
        }
        return new ColinearPointsConstraint(points);
    }

}

export class TangentLineConstraint implements Constraint {
    type = "tangent-line";
    center: VariablePoint;
    radius: Variable;
    p1: VariablePoint;
    p2: VariablePoint;
    constructor(center: VariablePoint, radius: Variable, p1: VariablePoint, p2: VariablePoint) {
        this.center = center;
        this.radius = radius;
        this.p1 = p1;
        this.p2 = p2;
    }
    getError(): number {
        let c = this.center.toPoint();
        let projection = c.projectBetween(this.p1.toPoint(), this.p2.toPoint());
        return Math.abs(projection.distTo(c) - this.radius.value) * 10;
    }
    getGradient(v: Variable): number {
        if(v == this.radius) {
            let c = this.center.toPoint();
            let projection = c.projectBetween(this.p1.toPoint(), this.p2.toPoint());
            return projection.distTo(c) - this.radius.value;
        } else if (this.p1.has(v) || this.p2.has(v) || this.center.has(v)) {
            let c = this.center.toPoint();
            let projection = c.projectBetween(this.p1.toPoint(), this.p2.toPoint());
            let dist = projection.distTo(c) - this.radius.value;
            let coincidentProjection = projection.pointTowards(c, dist);
            let delta = coincidentProjection.sub(projection);
            if(this.center.x == v) return -delta.x;
            if(this.center.y == v) return -delta.y;
            if(this.p1.x == v || this.p2.x == v) {
                return delta.x;
            } else {
                return delta.y;
            }
        }
        return 0;
    }
    containsFigure(f: Figure): boolean {
        if(f.type == "point") {
            return this.p1 == (f as PointFigure).p.variablePoint ||
                this.p2 == (f as PointFigure).p.variablePoint;
        } else if (f.type == "line") {
            //both points
            return this.containsFigure(f.childFigures[0]) && this.containsFigure(f.childFigures[1]);
        } else if (f.type == "circle") {
            //just radius
            return this.radius == (f as CircleFigure).r;
        }
        return false;
    }

    asObject(obj: SketchExport, sketch: Sketch): ConstraintExport {
        return {
            "type": this.type,
            "c": sketch.points.indexOf(this.center),
            "r": sketch.variables.indexOf(this.radius),
            "p1": sketch.points.indexOf(this.p1),
            "p2": sketch.points.indexOf(this.p2),
        };
    }

    static fromObject(c: ConstraintExport, sketch: Sketch): TangentLineConstraint {
        let ce = sketch.points[c["c"]];
        let r = sketch.variables[c["r"]];
        let p1 = sketch.points[c["p1"]];
        let p2 = sketch.points[c["p2"]];
        return new TangentLineConstraint(ce, r, p1, p2);
    }
}

export class TangentCircleConstraint implements Constraint {
    type = "tangent-circle";
    center1: VariablePoint;
    radius1: Variable;
    center2: VariablePoint;
    radius2: Variable;
    constructor(center1: VariablePoint, radius1: Variable, center2: VariablePoint, radius2: Variable) {
        this.center1 = center1;
        this.radius1 = radius1;
        this.center2 = center2;
        this.radius2 = radius2;
    }
    getError(): number {
        let dist = this.center1.toPoint().distTo(this.center2.toPoint());
        let r1 = this.radius1.value;
        let r2 = this.radius2.value;
        let maxR = Math.max(r1, r2);
        let rsum = r1 + r2;
        if(dist > maxR) {
            //circles are outside of each other.
            return Math.abs(dist - rsum)
        } else {
            //circle with smaller radius has center within other circle
            if(r1 < r2) {
                //circle 1 is inside circle 2
                return Math.abs(r2 - (dist + r1));
            } else {
                //circle 2 is inside circle 1
                return Math.abs(r1 - (dist + r2));
            }
        }
    }
    getGradient(v: Variable): number {
        if(this.radius1 == v || this.radius2 == v) {
            let dist = this.center1.toPoint().distTo(this.center2.toPoint());
            let r1 = this.radius1.value;
            let r2 = this.radius2.value;
            let maxR = Math.max(r1, r2);
            let rsum = r1 + r2;
            if(dist > maxR) {
                //circles are outside of each other.
                let delta = dist - rsum;
                if(this.radius1 == v && this.radius1.value + delta <= 0) return 0;
                if(this.radius2 == v && this.radius2.value + delta <= 0) return 0;
                return delta;
            } else {
                //circle with smaller radius has center within other circle
                if(r1 < r2) {
                    //circle 1 is inside circle 2
                    let delta = r2 - (dist + r1);
                    if(this.radius1 == v) {
                        return delta;
                    } else {
                        return -delta;
                    }
                } else {
                    //circle 2 is inside circle 1
                    let delta = r1 - (dist + r2);
                    if(this.radius2 == v) {
                        return delta;
                    } else {
                        return -delta;
                    }
                }
            }
        }
        if(this.center1.has(v) || this.center2.has(v)) {
            let dist = this.center1.toPoint().distTo(this.center2.toPoint());
            let r1 = this.radius1.value;
            let r2 = this.radius2.value;
            let maxR = Math.max(r1, r2);
            let rsum = r1 + r2;
            if(dist > maxR) {
                //circles are outside of each other.
                let delta = dist - rsum;
                if(this.center1.has(v)) {
                    let goal = this.center1.toPoint().pointTowards(this.center2.toPoint(), delta);
                    return this.center1.deltaVTowards(v, goal);
                } else {
                    let goal = this.center2.toPoint().pointTowards(this.center1.toPoint(), delta);
                    return this.center2.deltaVTowards(v, goal);
                }
            } else {
                //circle with smaller radius has center within other circle
                if(r1 < r2) {
                    //circle 1 is inside circle 2
                    let delta = r2 - (dist + r1);
                    if(this.center1.has(v)) {
                        let goal = this.center1.toPoint().pointTowards(this.center2.toPoint(), -delta);
                        return this.center1.deltaVTowards(v, goal);
                    } else {
                        let goal = this.center2.toPoint().pointTowards(this.center1.toPoint(), -delta);
                        return this.center2.deltaVTowards(v, goal);
                    }
                } else {
                    //circle 2 is inside circle 1
                    let delta = r1 - (dist + r2);
                    if(this.center1.has(v)) {
                        let goal = this.center1.toPoint().pointTowards(this.center2.toPoint(), -delta);
                        return this.center1.deltaVTowards(v, goal);
                    } else {
                        let goal = this.center2.toPoint().pointTowards(this.center1.toPoint(), -delta);
                        return this.center2.deltaVTowards(v, goal);
                    }
                }
            }
        }
        return 0;
    }
    containsFigure(f: Figure): boolean {
        if (f.type == "circle") {
            //just radius
            return this.radius1 == (f as CircleFigure).r ||
                   this.radius2 == (f as CircleFigure).r;
        }
        return false;
    }

    asObject(obj: SketchExport, sketch: Sketch): ConstraintExport {
        return {
            "type": this.type,
            "c1": sketch.points.indexOf(this.center1),
            "r1": sketch.variables.indexOf(this.radius1),
            "c2": sketch.points.indexOf(this.center2),
            "r2": sketch.variables.indexOf(this.radius2),
        };
    }
    static fromObject(c: ConstraintExport, sketch: Sketch): TangentCircleConstraint {
        let c1 = sketch.points[c["c1"]];
        let r1 = sketch.variables[c["r1"]];
        let c2 = sketch.points[c["c2"]];
        let r2 = sketch.variables[c["r2"]];
        return new TangentCircleConstraint(c1, r1, c2, r2);
    }
}


function leastSquaresRegression(points: VariablePoint[]): [Point, Point] {
    //hacky solution to avoid weird behavior when dragging vertical points
    let constantPoints: Point[] = [];
    for(let p of points) {
        if(p.x.constant) {
            constantPoints.push(p.toPoint());
        }
    }
    if(constantPoints.length > 1) {
        return [constantPoints[0], constantPoints[1]];
    }

    let xs = 0;
    let ys = 0;
    let x2s = 0;
    let y2s = 0;
    let xys = 0;
    let n = points.length;
    for(let point of points) {
        let x = point.x.value;
        let y = point.y.value;
        xs += x;
        ys += y;
        x2s += x * x;
        y2s += y * y;
        xys += x * y;
    }
    let numerator = (n * xys) - (xs * ys);
    let denominator = n * x2s - (xs * xs);
    if (denominator == 0 || Math.abs(numerator/denominator) > 1) {
        denominator = n * y2s - (ys * ys);

        let slope = numerator / denominator;
        let xintercept = (xs - slope * ys) / n;

        let p1 = new Point(xintercept, 0);
        let p2 = new Point(xintercept + slope, 1);
        return [p1, p2];
    }
    let slope = numerator / denominator;
    let yintercept = (ys - slope * xs) / n;

    let p1 = new Point(0, yintercept);
    let p2 = new Point(1, yintercept + slope);
    return [p1, p2];
}

export function constraintFromObject(c: ConstraintExport, sketch: Sketch): Constraint {
    switch(c.type) {
        case "equal":
            return EqualConstraint.fromObject(c, sketch);
        case "arc-point-coincident":
            return ArcPointCoincidentConstraint.fromObject(c, sketch);
        case "midpoint":
            return MidpointConstraint.fromObject(c, sketch);
        case "colinear":
            return ColinearPointsConstraint.fromObject(c, sketch);
        case "tangent-line":
            return TangentLineConstraint.fromObject(c, sketch);
        case "tangent-circle":
            return TangentCircleConstraint.fromObject(c, sketch);
    }
    return null;
}
