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
    rootFigures: Figure[] = [];
    solver: Solver;
    constructor() {
        this.solver = new Solver();
    }
    getClosestFigure(point: Point, ignoreFigures: Figure[] = []): Figure {
        let allFigures = [];
        for(let fig of this.rootFigures) {
            allFigures.push.apply(allFigures, fig.getRelatedFigures());
        }

        let filteredFigures = allFigures.filter(function(value, index, arr){
            return ignoreFigures.indexOf(value) == -1;
        });

        if(filteredFigures.length == 0) return null;
        let dist = filteredFigures[0].getClosestPoint(point).distTo(point);
        let closest = filteredFigures[0];

        for(let fig of filteredFigures) {
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

