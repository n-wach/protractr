import {CircleFigure, Figure, LineFigure, PointFigure} from "./figures";
import {
    Constraint,
    CoincidentPointConstraint,
    VerticalConstraint,
    HorizontalConstraint,
    LineMidpointConstraint,
    TangentConstraint,
    VariablePoint,
    EqualConstraint,
    ColinearPointsConstraint,
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
        return figs.length > 0;
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
        return figs.length > 0;
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
                if(hasCircle) return false;
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

class LineMidpointCoincidentFilter implements ConstraintFilter {
    name: string = "midpoint";
    validFigures(figs: Figure[]) {
        let hasLine = false;
        let hasPoint = false;
        for(let fig of figs) {
            if(fig.type == "point") {
                if(hasPoint) return false;
                hasPoint = true;
            } else if (fig.type == "line") {
                if(hasLine) return false;
                hasLine = true;
            }
        }
        return hasPoint && hasLine;
    }
    createConstraints(figs: Figure[]) {
        let point: PointFigure = null;
        let line: LineFigure = null;
        for(let fig of figs) {
            if(fig.type == "point") {
                point = fig as PointFigure;
            } else if(fig.type == "line") {
                line = fig as LineFigure;
            }
        }
        return [new LineMidpointConstraint(line.p1.variablePoint, line.p2.variablePoint, point.p.variablePoint)];
    }
}

class EqualRadiusConstraintFilter implements ConstraintFilter {
    name: string = "equal";

    createConstraints(figs: Figure[]): Constraint[] {
        let radii = [];
        for(let fig of figs as CircleFigure[]) {
            radii.push(fig.r);
        }
        return [new EqualConstraint(radii)];
    }

    validFigures(figs: Figure[]): boolean {
        for(let fig of figs) {
            if(fig.type != "circle") return false;
        }
        return figs.length > 1;
    }
}

class ColinearConstraintFilter implements ConstraintFilter {
    name: string = "colinear";
    validFigures(figs: Figure[]): boolean {
        let count = 0;
        for(let fig of figs) {
            if(fig.type == "point") {
                count += 1;
            } else if(fig.type == "line") {
                count += 2;
            } else {
                return false;
            }
        }
        return count > 3;
    }
    createConstraints(figs: Figure[]): Constraint[] {
        let points: VariablePoint[] = [];
        for(let fig of figs) {
            if(fig.type == "point") {
                points.push((fig as PointFigure).p.variablePoint);
            } else if(fig.type == "line") {
                points.push((fig as LineFigure).p1.variablePoint);
                points.push((fig as LineFigure).p2.variablePoint);
            }
        }
        return [new ColinearPointsConstraint(points)];
    }
}

let possibleConstraints = [
    new CoincidentPointFilter(),
    new HorizontalPointFilter(),
    new HorizontalLineFilter(),
    new VerticalPointFilter(),
    new VerticalLineFilter(),
    new ArcPointCoincidentFilter(),
    new LineMidpointCoincidentFilter(),
    new EqualRadiusConstraintFilter(),
    new ColinearConstraintFilter(),
];

export function getSatisfiedConstraintFilters(figs: Figure[]): ConstraintFilter[] {
    let possibilities = [];
    for(let pc of possibleConstraints) {
        if(pc.validFigures(figs)) possibilities.push(pc);
    }
    return possibilities;
}

