import {Constraint, Variable} from "./constraint";
import {Figure, Point} from "./figures";
import {Solver} from "./solver";
import {protractr} from "../main";

let typeMagnetism = {
    circle: 0,
    line: 0,
    point: 5,
};

export class Sketch {
    constraints: Constraint[] = [];
    variables: Variable[] = [];
    figures: Figure[] = [];
    solver: Solver;
    constructor() {
        this.solver = new Solver();
    }
    getClosestFigure(point: Point, ignoreFigures: Figure[] = []): Figure {
        if(this.figures.length == 0) return null;
        let dist = this.figures[0].getClosestPoint(point).distTo(point);
        let closest = this.figures[0];
        let allFigures = [];
        for(let fig of this.figures) {
            allFigures.push(fig);
            for(let child of fig.childFigures) {
                allFigures.push(child);
            }
        }
        for(let fig of allFigures) {
            if(ignoreFigures.indexOf(fig) != -1) continue;
            let p = fig.getClosestPoint(point);
            let d = p.distTo(point) - typeMagnetism[fig.type];
            if(d < dist) {
                closest = fig;
                dist = d;
            }
        }
        return closest;
    }
}

