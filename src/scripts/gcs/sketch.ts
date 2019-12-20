/**
 * @module gcs/sketch
 */
/** */

import {
    ArcPointCoincidentConstraint,
    ColinearPointsConstraint,
    Constraint,
    constraintFromObject,
    EqualConstraint,
    EqualLengthConstraint,
    Variable,
    VariablePoint
} from "./constraint";
import {CircleFigure, Figure, figureFromObject, LineFigure, Point, PointFigure} from "./figures";

let typeMagnetism = {
    circle: 0,
    line: 0,
    point: 5,
};

export type FigureExport = {
    type: string,
    [a: string]: any,
};
export type ConstraintExport = {
    type: string,
    [a: string]: any,
};
export type SketchExport = {
    variables: number[];
    points: [number, number][],
    figures: FigureExport[],
    constraints: ConstraintExport[],
};

export class Sketch {
    constraints: Constraint[] = [];
    variables: Variable[] = [];
    points: VariablePoint[] = [];
    rootFigures: Figure[] = [];

    getClosestFigure(point: Point, ignoreFigures: Figure[] = [], maxDist: number = 10, scale: number = 1): Figure {
        let allFigures = [];
        for(let fig of this.rootFigures) {
            allFigures.push.apply(allFigures, fig.getRelatedFigures());
        }

        let filteredFigures = allFigures.filter(function(value, index, arr) {
            return ignoreFigures.indexOf(value) == -1;
        });

        if (filteredFigures.length == 0) return null;
        let dist = filteredFigures[0].getClosestPoint(point).distTo(point);
        let closest = filteredFigures[0];

        for(let fig of filteredFigures) {
            let p = fig.getClosestPoint(point);
            let d = p.distTo(point) - typeMagnetism[fig.type] / scale;
            if (d < dist) {
                closest = fig;
                dist = d;
            }
        }
        if (dist <= maxDist / scale) {
            return closest;
        } else {
            return null;
        }
    }

    addConstraintAndCombine(constraint: Constraint) {
        if (constraint.type == "equal") {
            let e1: EqualConstraint = constraint as EqualConstraint;
            let mergeables: EqualConstraint[] = [];
            for(let c of this.constraints) {
                if (c.type == "equal") {
                    let e2: EqualConstraint = c as EqualConstraint;
                    for(let v of e1.variables) {
                        if (e2.variables.indexOf(v) != -1) {
                            //intersection constraint domain
                            mergeables.push(e2);
                            break;
                        }
                    }
                }
            }
            if (mergeables.length > 0) {
                let newVariables: Variable[] = [];
                for(let m of mergeables) {
                    newVariables = newVariables.concat(m.variables);
                }
                for(let v of e1.variables) {
                    if (newVariables.indexOf(v) == -1) {
                        //variable not present in merged intersecting constraints
                        newVariables.push(v);
                    }
                }
                let newEqual = new EqualConstraint(newVariables, constraint.name);
                for(let m of mergeables) this.removeConstraint(m);
                this.constraints.push(newEqual);
            } else {
                this.constraints.push(constraint);
            }
        } else if (constraint.type == "colinear") {
            let cl1: ColinearPointsConstraint = constraint as ColinearPointsConstraint;
            let mergeables: ColinearPointsConstraint[] = [];
            for(let c of this.constraints) {
                if (c.type == "colinear") {
                    let cl2: ColinearPointsConstraint = c as ColinearPointsConstraint;
                    let count = 0;
                    for(let p of cl1.points) {
                        if (cl2.points.indexOf(p) != -1) {
                            count += 1;
                            if (count >= 2) {
                                //intersection constraint domain
                                mergeables.push(cl2);
                                break;
                            }
                        }
                    }
                }
            }
            if (mergeables.length > 0) {
                let newPoints: VariablePoint[] = [];
                for(let m of mergeables) {
                    newPoints = newPoints.concat(m.points);
                }
                for(let p of cl1.points) {
                    if (newPoints.indexOf(p) == -1) {
                        //variable not present in merged intersecting constraints
                        newPoints.push(p);
                    }
                }
                let newColinear = new ColinearPointsConstraint(newPoints, constraint.name);
                for(let m of mergeables) this.removeConstraint(m);
                this.constraints.push(newColinear);
            } else {
                this.constraints.push(constraint);
            }
        } else if (constraint.type == "arc-point-coincident") {
            let apc1: ArcPointCoincidentConstraint = constraint as ArcPointCoincidentConstraint;
            let mergeable: ArcPointCoincidentConstraint;
            for(let c of this.constraints) {
                if (c.type == "arc-point-coincident") {
                    let apc2: ArcPointCoincidentConstraint = c as ArcPointCoincidentConstraint;
                    if (apc1.center == apc2.center) {
                        mergeable = apc2;
                        break;
                    }
                }
            }
            if (mergeable) {
                for(let p of apc1.points) {
                    mergeable.points.push(p);
                }
            } else {
                this.constraints.push(constraint);
            }
        } else if (constraint.type == "equal-length") {
            let el1: EqualLengthConstraint = constraint as EqualLengthConstraint;
            let mergeables: EqualLengthConstraint[] = [];
            for(let c of this.constraints) {
                if (c.type == "equal-length") {
                    let el2: EqualLengthConstraint = c as EqualLengthConstraint;
                    for(let pair1 of el1.pairs) {
                        for(let pair2 of el2.pairs) {
                            if (pair1[0] == pair2[0] && pair1[1] == pair2[1]) {
                                mergeables.push(el2);
                            }
                        }
                    }
                }
            }
            if (mergeables.length > 0) {
                for(let mergeable of mergeables) {
                    for(let p of mergeable.pairs) {
                        el1.pairs.push(p);
                    }
                    this.removeConstraint(mergeable);
                }
            }
            this.constraints.push(constraint);
        } else {
            this.constraints.push(constraint);
        }
    }

    addConstraints(constraints: Constraint[]) {
        for(let c of constraints) {
            this.addConstraintAndCombine(c);
        }
        this.solveConstraints(true);
    }

    removeConstraint(constraint: Constraint) {
        this.constraints = this.constraints.filter(function(value, index, arr) {
            return value != constraint;
        });
    }

    addPoint(point: VariablePoint) {
        this.points.push(point);
        this.addVariable(point.x);
        this.addVariable(point.y);
    }

    addVariable(variable: Variable) {
        this.variables.push(variable);
    }

    solveConstraints(tirelessSolve: boolean = false) {
        let startTime = new Date().getTime();
        let count = 1;
        while(true) {
            let totalError = 0;
            for(let constraint of this.constraints) {
                totalError += constraint.getError();
            }
            if (totalError < 1 && count > 10) return; // solved, still do a few iterations though...
            if (count > 100 && !tirelessSolve) return;
            if (count % 10000 == 0) {
                let currentTime = new Date().getTime();
                if (currentTime - startTime > 1000) break; //give up after one second.
            }
            let variableGradients = [];
            let contributorCount = [];
            for(let variable of this.variables) {
                let gradient = 0;
                let count = 0;
                for(let constraint of this.constraints) {
                    let g = constraint.getGradient(variable);
                    if (g != 0) {
                        gradient += g;
                        count++;
                    }
                }
                variableGradients.push(gradient);
                contributorCount.push(count);
            }
            for(let i = 0; i < variableGradients.length; i++) {
                this.variables[i].value += variableGradients[i] / (2 + contributorCount[i]);
            }
            count += 1;
        }
        //state solve failed.  display an error:
        alert("That state couldn't be solved...");
    }

    asObject(): SketchExport {
        let obj: SketchExport = {
            "variables": [],
            "points": [],
            "figures": [],
            "constraints": [],
        };
        for(let v of this.variables) {
            obj.variables.push(v.value);
        }
        for(let p of this.points) {
            let xp = this.variables.indexOf(p.x);
            let yp = this.variables.indexOf(p.y);
            obj.points.push([xp, yp])
        }
        for(let fig of this.rootFigures) {
            obj.figures.push(fig.asObject(obj, this));
        }
        for(let constraint of this.constraints) {
            obj.constraints.push(constraint.asObject(obj, this));
        }
        return obj;
    }

    static fromObject(obj: SketchExport): Sketch {
        let sketch = new Sketch();
        for(let v of obj.variables) {
            sketch.variables.push(new Variable(v));
        }
        for(let p of obj.points) {
            let xv = sketch.variables[p[0]];
            let yv = sketch.variables[p[1]];
            let vp = VariablePoint.fromVariables(xv, yv);
            sketch.points.push(vp);
        }
        for(let fig of obj.figures) {
            sketch.rootFigures.push(figureFromObject(fig, sketch));
        }
        for(let constraint of obj.constraints) {
            sketch.constraints.push(constraintFromObject(constraint, sketch));
        }
        return sketch;
    }

    addFigure(figure: Figure) {
        this.rootFigures.push(figure);
        switch(figure.type){
            case "point":
                this.addPoint((figure as PointFigure).p.variablePoint);
                break;
            case "line":
                this.addPoint((figure as LineFigure).p1.variablePoint);
                this.addPoint((figure as LineFigure).p2.variablePoint);
                break;
            case "circle":
                this.addPoint((figure as CircleFigure).c.variablePoint);
                this.addVariable((figure as CircleFigure).r);
                break;
        }
    }
}

