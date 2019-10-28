import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "./figures";

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
    getError(): number;
    getGradient(v: Variable): number; //how to adjust v to reduce error
}

class EqualConstraint implements Constraint {
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
}

class CoincidentConstraint implements Constraint {
    xEqual: EqualConstraint;
    yEqual: EqualConstraint;
    constructor(points: VariablePoint[]) {
        let xs: Variable[] = [];
        let ys: Variable[] = [];
        for(let p of points) {
            xs.push(p.x);
            ys.push(p.y);
        }
        this.xEqual = new EqualConstraint(xs);
        this.yEqual = new EqualConstraint(ys);
    }
    getError(): number {
        return this.xEqual.getError() + this.yEqual.getError();
    }
    getGradient(v: Variable): number {
        return this.xEqual.getGradient(v) + this.yEqual.getGradient(v);
    }
}

class LockConstraint implements Constraint {
    variable: Variable;
    value: number;
    constructor(val: Variable) {
        this.variable = val;
        this.value = val.value;
    }
    getError(): number {
        return Math.abs(this.variable.value - this.value);
    }
    getGradient(v: Variable): number {
        if(this.variable != v) return 0;
        return this.value - this.variable.value;
    }
}

class HorizontalConstraint extends EqualConstraint {
    constructor(points: VariablePoint[]) {
        let ys: Variable[] = [];
        for(let p of points) {
            ys.push(p.y);
        }
        super(ys);
    }
}

class VerticalConstraint extends EqualConstraint {
    constructor(points: VariablePoint[]) {
        let xs: Variable[] = [];
        for(let p of points) {
            xs.push(p.x);
        }
        super(xs);
    }
}


class TangentConstraint implements Constraint {
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
        for(let p of this.points) {
            let dx = p.x.value - this.center.x.value;
            let dy = p.y.value - this.center.y.value;
            error += Math.abs(this.radius.value - Math.sqrt(dx * dx + dy * dy));
        }
        return error;
    }
    getGradient(v: Variable): number {
        for(let p of this.points) {
            if(p.x === v || p.y === v) {
                let center = new Point(this.center.x.value, this.center.y.value);
                let target = new Point(p.x.value, p.y.value);
                let goal = center.pointTowards(target, this.radius.value);
                if(p.x == v) {
                    return goal.x - v.value;
                } else {
                    return goal.y - v.value;
                }
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
        return 0;
    }
}

class ConstraintPossibility {
    requiredTypes: string[];
    possibleConstraint: string;
    constructor(requiredTypes: string[], possibleConstraint: string) {
        this.requiredTypes = requiredTypes;
        this.possibleConstraint = possibleConstraint;
    }
    satisfiesTypes(s: string[]): boolean {
        return s.sort().join("") == this.requiredTypes.sort().join("");
    }
    makeConstraint(figures: Figure[]) {
        if(this.possibleConstraint == "horizontal") {
            let points = [];
            for(let fig of figures) {
                points.push((fig as LineFigure).p1.variablePoint);
                points.push((fig as LineFigure).p2.variablePoint);
            }
            return new HorizontalConstraint(points)
        }
        if(this.possibleConstraint == "vertical") {
            let points = [];
            for(let fig of figures) {
                points.push((fig as LineFigure).p1.variablePoint);
                points.push((fig as LineFigure).p2.variablePoint);
            }
            return new VerticalConstraint(points)
        }
        if(this.possibleConstraint == "coincident") {
            let points = [];
            for(let fig of figures) {
                points.push((fig as PointFigure).p.variablePoint);
            }
            return new CoincidentConstraint(points)
        }
        if(this.possibleConstraint == "tangent") {
            let points: VariablePoint[] = [];
            let circle: CircleFigure = null;
            for(let fig of figures) {
                if(fig.type == "point") {
                    points.push((fig as PointFigure).p.variablePoint);
                    continue;
                }
                if(fig.type == "circle") {
                    circle = fig as CircleFigure;
                }
            }
            return new TangentConstraint(circle.c.variablePoint, circle.r, points);
        }
        return undefined;
    }
}

let possibleConstraints = [
    new ConstraintPossibility(["point", "point"], "coincident"),
    new ConstraintPossibility(["point"], "lock"),
    //new ConstraintPossibility(["line", "point"], "coincident"),
    new ConstraintPossibility(["line", "point"], "midpoint"),
    new ConstraintPossibility(["line"], "horizontal"),
    new ConstraintPossibility(["line"], "vertical"),
    new ConstraintPossibility(["line"], "lock"),
    new ConstraintPossibility(["line", "line"], "perpendicular"),
    new ConstraintPossibility(["line", "line"], "parallel"),
    new ConstraintPossibility(["line", "circle"], "tangent"),
    //new ConstraintPossibility(["line", "circle"], "coincident"),
    new ConstraintPossibility(["line", "circle"], "equal"), // diameter equals length
    new ConstraintPossibility(["circle"], "lock"),
    new ConstraintPossibility(["circle", "circle"], "equal"),
    new ConstraintPossibility(["circle", "circle"], "concentric"),
    new ConstraintPossibility(["circle", "point"], "center"),
    new ConstraintPossibility(["circle", "point"], "tangent"),
];

export function getPossibleConstraints(figs: Figure[]): ConstraintPossibility[] {
    let shapes = [];
    for(let fig of figs) {
        shapes.push(fig.type);
    }
    let possibilities = [];
    for(let pc of possibleConstraints) {
        if(pc.satisfiesTypes(shapes)) possibilities.push(pc);
    }
    return possibilities;
}


