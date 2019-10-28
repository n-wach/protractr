import {Figure, LineFigure, PointFigure} from "./figures";

export class Variable {
    value: number;
    constructor(v: number) {
        this.value = v;
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

function average(vals: Variable[]): number {
    return sum(vals) / vals.length;
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
        let avg = average(this.variables);
        for(let v of this.variables) {
            error += Math.abs(avg - v.value);
        }
        return error;
    }
    getGradient(v: Variable): number {
        if(this.variables.indexOf(v) == -1) return 0;
        let avg = average(this.variables);
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


