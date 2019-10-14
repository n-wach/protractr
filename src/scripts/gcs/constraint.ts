import {Figure} from "./figures";

export interface Constraint {

}

export class Variable {

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
}

let possibleConstraints = [
    new ConstraintPossibility(["point", "point"], "coincident"),
    new ConstraintPossibility(["point"], "lock"),
    new ConstraintPossibility(["line", "point"], "coincident"),
    new ConstraintPossibility(["line", "point"], "midpoint"),
    new ConstraintPossibility(["line"], "horizontal"),
    new ConstraintPossibility(["line"], "vertical"),
    new ConstraintPossibility(["line"], "lock"),
    new ConstraintPossibility(["line", "line"], "perpendicular"),
    new ConstraintPossibility(["line", "line"], "parallel"),
    new ConstraintPossibility(["line", "circle"], "tangent"),
    new ConstraintPossibility(["line", "circle"], "coincident"),
    new ConstraintPossibility(["line", "circle"], "equal"), // diameter equals length
    new ConstraintPossibility(["circle"], "lock"),
    new ConstraintPossibility(["circle", "circle"], "equal"),
    new ConstraintPossibility(["circle", "circle"], "concentric"),
    new ConstraintPossibility(["circle", "point"], "center"),
    new ConstraintPossibility(["circle", "point"], "tangent"),
];

export function getPossibleConstraints(figs: Figure[]) {
    let shapes = [];
    for(let fig of figs) {
        shapes.push(fig.type);
    }
    let possibilities = [];
    for(let pc of possibleConstraints) {
        if(pc.satisfiesTypes(shapes)) possibilities.push(pc.possibleConstraint);
    }
    return possibilities;
}


