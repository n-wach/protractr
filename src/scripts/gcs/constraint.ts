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
    toPoint(): Point {
        return new Point(this.x.value, this.y.value);
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

export class EqualConstraint implements Constraint {
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

export class CoincidentPointConstraint implements Constraint {
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

export class LockConstraint implements Constraint {
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

export class HorizontalConstraint extends EqualConstraint {
    constructor(points: VariablePoint[]) {
        let ys: Variable[] = [];
        for(let p of points) {
            ys.push(p.y);
        }
        super(ys);
    }
}

export class VerticalConstraint extends EqualConstraint {
    constructor(points: VariablePoint[]) {
        let xs: Variable[] = [];
        for(let p of points) {
            xs.push(p.x);
        }
        super(xs);
    }
}


export class TangentConstraint implements Constraint {
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
                let center = this.center.toPoint();
                let target = p.toPoint()
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
        //TODO add gradients for center of circle.  look for that one stack overflow post again
        return 0;
    }
}

export class LineMidpointConstraint implements Constraint {
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
        } else if (v === this.p1.x || v === this.p1.y) {
            let p2 = this.p2.toPoint();
            let midpoint = this.midpoint.toPoint();
            let halfDist = p2.distTo(midpoint);
            let fullDist = halfDist * 2;
            let goalP1 = p2.pointTowards(midpoint, fullDist);

            if(this.p1.x == v) {
                return goalP1.x - v.value;
            } else {
                return goalP1.y - v.value;
            }
        } else if (v === this.p2.x || v === this.p2.y) {
            let p1 = this.p1.toPoint();
            let midpoint = this.midpoint.toPoint();
            let halfDist = p1.distTo(midpoint);
            let fullDist = halfDist * 2;
            let goalP2 = p1.pointTowards(midpoint, fullDist);

            if(this.p2.x == v) {
                return goalP2.x - v.value;
            } else {
                return goalP2.y - v.value;
            }
        }
        return 0;
    }
}

export class ColinearPointConstraint implements Constraint {
    p1: VariablePoint;
    p2: VariablePoint;
    p: VariablePoint;

    constructor(p1: VariablePoint, p2: VariablePoint, p: VariablePoint) {
        this.p1 = p1;
        this.p2 = p2;
        this.p = p;
    }
    getError(): number {
        let p = this.p.toPoint();
        let projected = p.projectBetween(this.p1.toPoint(), this.p2.toPoint());
        return p.distTo(projected);
    }
    getGradient(v: Variable): number {
        if (this.p1.x == v || this.p1.y == v) {
            let p1 = this.p1.toPoint();
            let projected = p1.projectBetween(this.p.toPoint(), this.p2.toPoint());
            if(this.p1.x == v) {
                return projected.x - v.value;
            } else {
                return projected.y - v.value;
            }
        } else if (this.p2.x == v || this.p2.y == v) {
            let p2 = this.p2.toPoint();
            let projected = p2.projectBetween(this.p.toPoint(), this.p1.toPoint());
            if(this.p2.x == v) {
                return projected.x - v.value;
            } else {
                return projected.y - v.value;
            }
        } else if (this.p.x == v || this.p.y == v) {
            let p = this.p.toPoint();
            let projected = p.projectBetween(this.p1.toPoint(), this.p2.toPoint());
            if(this.p.x == v) {
                return projected.x - v.value;
            } else {
                return projected.y - v.value;
            }
        }
        return 0;
    }
}
