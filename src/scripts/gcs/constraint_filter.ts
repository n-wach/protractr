import {CircleFigure, Figure, LineFigure, PointFigure} from "./figures";
import {
    CoincidentPointConstraint, Constraint,
    HorizontalConstraint, LockConstraint,
    TangentConstraint,
    VariablePoint,
    VerticalConstraint
} from "./constraint";

interface ConstraintFilter {
    name: string;
    validFigures(figs: Figure[]): boolean;
    createConstraints(figs: Figure[]): Constraint[];
}

class HorizontalPointFilter implements ConstraintFilter {
    name: string = "horizontal";
    validFigures(figs: Figure[]) {
        for(let fig of figs) {
            if(fig.type != "point") return false;
        }
        return figs.length > 1;
    }
    createConstraints(figs: Figure[]) {
        let points = [];
        for(let fig of figs as PointFigure[]) {
            points.push(fig.p.variablePoint);
        }
        return [new HorizontalConstraint(points)];
    }
}

class VerticalPointFilter implements ConstraintFilter {
    name: string = "vertical";
    validFigures(figs: Figure[]) {
        for(let fig of figs) {
            if(fig.type != "point") return false;
        }
        return figs.length > 1;
    }
    createConstraints(figs: Figure[]) {
        let points = [];
        for(let fig of figs as PointFigure[]) {
            points.push(fig.p.variablePoint);
        }
        return [new VerticalConstraint(points)];
    }
}

class VerticalLineFilter implements ConstraintFilter {
    name: string = "vertical";
    validFigures(figs: Figure[]) {
        for(let fig of figs) {
            if(fig.type != "line") return false;
        }
        return figs.length > 1;
    }
    createConstraints(figs: Figure[]) {
        let constraints = [];
        for(let line of figs as LineFigure[]) {
            constraints.push(new VerticalConstraint([line.p1.variablePoint, line.p2.variablePoint]));
        }
        return constraints;
    }
}

class HorizontalLineFilter implements ConstraintFilter {
    name: string = "horizontal";
    validFigures(figs: Figure[]) {
        for(let fig of figs) {
            if(fig.type != "line") return false;
        }
        return figs.length > 1;
    }
    createConstraints(figs: Figure[]) {
        let constraints = [];
        for(let line of figs as LineFigure[]) {
            constraints.push(new HorizontalConstraint([line.p1.variablePoint, line.p2.variablePoint]));
        }
        return constraints;
    }
}

class CoincidentPointFilter implements ConstraintFilter {
    name: string = "coincident";
    validFigures(figs: Figure[]) {
        let count = 0;
        for(let fig of figs) {
            if(fig.type == "point") count += 1;
            else return false;
        }
        return count > 1;
    }
    createConstraints(figs: Figure[]) {
        let points = [];
        for(let fig of figs as PointFigure[]) {
            points.push(fig.p.variablePoint);
        }
        return [new CoincidentPointConstraint(points)];
    }
}

class ArcPointCoincidentFilter implements ConstraintFilter {
    name: string = "coincident";
    validFigures(figs: Figure[]) {
        let hasCircle = false;
        let hasPoints = false;
        for(let fig of figs) {
            if(fig.type == "point") {
                hasPoints = true;
            } else if (fig.type == "circle") {
                hasCircle = true;
            }
        }
        return hasPoints && hasCircle;
    }
    createConstraints(figs: Figure[]) {
        let points: VariablePoint[] = [];
        let circle: CircleFigure = null;
        for(let fig of figs) {
            if(fig.type == "point") {
                points.push((fig as PointFigure).p.variablePoint);
            } else if(fig.type == "circle") {
                circle = fig as CircleFigure;
            }
        }
        return [new TangentConstraint(circle.c.variablePoint, circle.r, points)];
    }
}

let possibleConstraints = [
    new CoincidentPointFilter(),
    new HorizontalPointFilter(),
    new HorizontalLineFilter(),
    new VerticalPointFilter(),
    new VerticalLineFilter(),
    new ArcPointCoincidentFilter(),
];

export function getSatisfiedConstraintFilters(figs: Figure[]): ConstraintFilter[] {
    let possibilities = [];
    for(let pc of possibleConstraints) {
        if(pc.validFigures(figs)) possibilities.push(pc);
    }
    return possibilities;
}

