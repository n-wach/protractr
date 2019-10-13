import {Constraint, Variable} from "./constraint";
import {Figure, Point} from "./figures";
import {Solver} from "./solver";
import {protractr} from "../main";

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
        for(let fig of this.figures) {
            if(ignoreFigures.indexOf(fig) != -1) continue;
            let p = fig.getClosestPoint(point);
            //protractr.ui.sketchView.drawPoint(p, 3, "blue");
            let d = p.distTo(point);
            if(d < dist) {
                closest = fig;
                dist = d;
            }
        }
        return closest;
    }
}
