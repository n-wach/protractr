import {Constraint, Variable} from "./constraint";
import {Figure} from "./figures";
import {Solver} from "./solver";

export class Sketch {
    constraints: Constraint[] = [];
    variables: Variable[] = [];
    figures: Figure[] = [];
    solver: Solver;
    constructor() {
        this.solver = new Solver();
    }
}
