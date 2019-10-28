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
    addConstraint(constraint) {
        this.constraints.push(constraint);
        this.solveConstraints();
    }
    removeConstraint(constraint) {
        this.constraints = this.constraints.filter(function(value, index, arr) {
            return value != constraint;
        });
    }
    addVariable(variable: Variable) {
        this.variables.push(variable);
    }
    removeVariable(variable) {
        this.variables = this.variables.filter(function(value, index, arr) {
            return value != variable;
        });
    }
    solveConstraints(tirelessSolve:boolean=false): boolean {
        let count = 0;
        let previousError = 0;
        while(true) {
            let totalError = 0;
            for (let constraint of this.constraints) {
                totalError += constraint.getError();
            }
            if (totalError < 1) return true;
            if (count > 30 && !tirelessSolve) return false;
            let variableGradients = [];
            let contributorCount = [];
            for (let variable of this.variables) {
                let gradient = 0;
                let count = 0;
                for (let constraint of this.constraints) {
                    let g = constraint.getGradient(variable);
                    if(g != 0) {
                        gradient += g;
                        count++;
                    }
                }
                variableGradients.push(gradient);
                contributorCount.push(count);
            }
            for (let i = 0; i < variableGradients.length; i++) {
                this.variables[i].value += variableGradients[i] / (1 + contributorCount[i]);
            }
            count += 1;
            previousError = totalError;
        }
    }
}

