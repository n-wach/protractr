import {CircleFigure, Figure, LineFigure, PointFigure} from "./figures";
import {
    ArcPointCoincidentConstraint,
    ColinearPointsConstraint,
    Constraint,
    EqualConstraint,
    EqualLengthConstraint,
    MidpointConstraint,
    TangentCircleConstraint,
    TangentLineConstraint,
    Variable,
    VariablePoint,
} from "./constraint";
import FilterString from "./filterString";


export interface ConstraintFilter {
    name: string;
    filter: FilterString;

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[];
}

class HorizontalPointFilter implements ConstraintFilter {
    name: string = "horizontal";
    filter = new FilterString(":2+point");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let ys: Variable[] = [];
        for(let point of sortedFigures.point) {
            ys.push(point.p.variablePoint.y);
        }
        return [new EqualConstraint(ys, "horizontal")];
    }
}

class VerticalPointFilter implements ConstraintFilter {
    name: string = "vertical";
    filter = new FilterString(":2+point");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let xs: Variable[] = [];
        for(let point of sortedFigures.point) {
            xs.push(point.p.variablePoint.x);
        }
        return [new EqualConstraint(xs, "vertical")];
    }
}

class VerticalLineFilter implements ConstraintFilter {
    name: string = "vertical";
    filter = new FilterString(":1+line");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let constraints = [];
        for(let line of sortedFigures.line) {
            constraints.push(new EqualConstraint([line.p1.variablePoint.x, line.p2.variablePoint.x], "vertical"));
        }
        return constraints;
    }
}

class HorizontalLineFilter implements ConstraintFilter {
    name: string = "horizontal";
    filter = new FilterString(":1+line");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let constraints = [];
        for(let line of sortedFigures.line) {
            constraints.push(new EqualConstraint([line.p1.variablePoint.y, line.p2.variablePoint.y], "horizontal"));
        }
        return constraints;
    }
}

class CoincidentPointFilter implements ConstraintFilter {
    name: string = "coincident";
    filter = new FilterString(":2+point");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let xs: Variable[] = [];
        let ys: Variable[] = [];
        for(let fig of sortedFigures.point) {
            xs.push(fig.p.variablePoint.x);
            ys.push(fig.p.variablePoint.y);
        }
        return [new EqualConstraint(xs, "vertical"), new EqualConstraint(ys, "horizontal")];
    }
}

class ArcPointFilter implements ConstraintFilter {
    name: string = "coincident";
    filter = new FilterString(":circle&1+point");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let points: VariablePoint[] = [];
        let circle: CircleFigure = sortedFigures.circle[0];
        for(let point of sortedFigures.point) {
            points.push(point.p.variablePoint);
        }
        return [new ArcPointCoincidentConstraint(circle.c.variablePoint, circle.r, points, "point on circle")];
    }
}

class LineMidpointFilter implements ConstraintFilter {
    name: string = "midpoint";
    filter = new FilterString(":line&point");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let point: PointFigure = sortedFigures.point[0];
        let line: LineFigure = sortedFigures.line[0];
        return [new MidpointConstraint(line.p1.variablePoint, line.p2.variablePoint, point.p.variablePoint, "midpoint")];
    }
}

class EqualRadiusFilter implements ConstraintFilter {
    name: string = "equal";
    filter = new FilterString(":2+circle");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let radii = [];
        for(let circle of sortedFigures.circle) {
            radii.push(circle.r);
        }
        return [new EqualConstraint(radii, "equal radii")];
    }
}

class ColinearFilter implements ConstraintFilter {
    name: string = "colinear";
    filter = new FilterString("line as 2 point:3+point");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let points: VariablePoint[] = [];
        for(let point of sortedFigures.point) {
            points.push(point.p.variablePoint);
        }
        for(let line of sortedFigures.line) {
            points.push(line.p1.variablePoint);
            points.push(line.p2.variablePoint);
        }
        return [new ColinearPointsConstraint(points, "colinear")];
    }
}

export class TangentLineFilter implements ConstraintFilter {
    name: string = "tangent";
    filter = new FilterString(":circle&1+line");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let circle: CircleFigure = sortedFigures.circle[0];
        let constraints = [];
        for(let line of sortedFigures.line) {
            constraints.push(new TangentLineConstraint(circle.c.variablePoint, circle.r, line.p1.variablePoint, line.p2.variablePoint, "tangent line"));
        }
        return constraints;
    }
}

export class ConcentricCirclesFilter implements ConstraintFilter {
    name: string = "concentric";
    filter = new FilterString(":1+circle&*point");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let xs: Variable[] = [];
        let ys: Variable[] = [];
        for(let circle of sortedFigures.circle) {
            xs.push(circle.c.variablePoint.x);
            ys.push(circle.c.variablePoint.y);
        }
        for(let point of sortedFigures.point) {
            xs.push(point.p.variablePoint.x);
            ys.push(point.p.variablePoint.y);
        }
        return [new EqualConstraint(xs, "vertical"), new EqualConstraint(ys, "horizontal")];
    }
}

export class LineIntersectionFilter implements ConstraintFilter {
    name: string = "intersection";
    filter = new FilterString(":point&2+line");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let lines: LineFigure[] = sortedFigures.line;
        let point: PointFigure = sortedFigures.point[0];
        let constraints = [];
        for(let line of lines) {
            constraints.push(new ColinearPointsConstraint([line.p1.variablePoint, line.p2.variablePoint, point.p.variablePoint], "colinear"));
        }
        return constraints;
    }
}


export class CircleIntersectionFilter implements ConstraintFilter {
    name: string = "intersection";
    filter = new FilterString(":point&2+circle");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let circles: CircleFigure[] = sortedFigures.circle;
        let point: PointFigure = sortedFigures.point[0];
        let constraints = [];
        for(let circle of circles) {
            constraints.push(new ArcPointCoincidentConstraint(circle.c.variablePoint, circle.r, [point.p.variablePoint], "point on circle"));
        }
        return constraints;
    }
}

export class TangentCirclesFilter implements ConstraintFilter {
    name: string = "tangent";
    filter = new FilterString(":2circle");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let circle1 = sortedFigures.circle[0];
        let circle2 = sortedFigures.circle[1];
        return [new TangentCircleConstraint(circle1.c.variablePoint, circle1.r, circle2.c.variablePoint, circle2.r, "tangent circles")];
    }
}

export class EqualLengthFilter implements ConstraintFilter {
    name: string = "equal";
    filter = new FilterString(":2+line");

    createConstraints(sortedFigures: SortedFigureSelection): Constraint[] {
        let lines = sortedFigures.line;
        let pairs: [VariablePoint, VariablePoint][] = [];
        for(let line of lines) {
            pairs.push([line.p1.variablePoint, line.p2.variablePoint]);
        }
        return [new EqualLengthConstraint(pairs, "equal lengths")]
    }
}

let possibleConstraints = [
    //pointy
    new CoincidentPointFilter(),
    new HorizontalPointFilter(),
    new VerticalPointFilter(),
    //liney
    new HorizontalLineFilter(),
    new VerticalLineFilter(),
    new ColinearFilter(),
    new LineIntersectionFilter(),
    new LineMidpointFilter(),
    new EqualLengthFilter(),
    //circley
    new EqualRadiusFilter(),
    new ConcentricCirclesFilter(),
    new TangentCirclesFilter(),
    new CircleIntersectionFilter(),
    new ArcPointFilter(),
    new TangentLineFilter(),
];

type SortedFigureSelection = {
    point: PointFigure[],
    line: LineFigure[],
    circle: CircleFigure[],
};

export function sortFigureSelection(figures: Figure[]): SortedFigureSelection {
    let sortedFigures: SortedFigureSelection = {
        point: [],
        line: [],
        circle: [],
    };
    for(let f of figures) {
        sortedFigures[f.type].push(f);
    }
    return sortedFigures;
}

export function getSatisfiedConstraintFilters(figs: Figure[]): ConstraintFilter[] {
    let possibilities = [];
    for(let pc of possibleConstraints) {
        if (pc.filter.satisfiesFilter(figs)) possibilities.push(pc);
    }
    return possibilities;
}

