import Variable, {Value} from "../variable";
import Relation, {VariableDelta} from "./relation";
import RelationEqual from "./relationEqual";
import RelationColinearPoints from "./relationColinearPoints";
import RelationPointsOnCircle from "./relationPointsOnCircle";
import RelationEqualLength from "./relationEqualLength";

export default class RelationManager {
    relations: Relation[] = [];

    static SOLVE_TOLERANCE = 1;

    getTotalError(): number {
        let error = 0;
        for(let relation of this.relations) {
            error += relation.getError();
        }
        return error;
    }

    isSolved() {
        return this.getTotalError() < RelationManager.SOLVE_TOLERANCE;
    }

    solveRelations(tireless: boolean = false) {
        let startTime = new Date().getTime();
        let count = 1;
        while(true) {
            if(this.isSolved() && count > 10) return; // solved, still do a few iterations for fun though...
            if(!tireless && count > 150) return; // not tireless so we can give up quickly

            // even if tireless, we should still give up eventually...
            if (count % 10000 == 0) {
                let currentTime = new Date().getTime();
                if (currentTime - startTime > 1000) return; //give up after one second.
            }

            let variableDeltas: VariableDelta[] = [];
            for(let relation of this.relations) {
                variableDeltas.push(...relation.getDeltas());
            }

            // sort variables by value reference and count contributors
            let values = new Map<Value, {totalDelta: number, contributorCount: number}>();
            for(let variableDelta of variableDeltas) {
                let value: Value = variableDelta[0]._v;
                let delta: number = variableDelta[1];
                if(values.has(value)) {
                    let valueDelta = values.get(value);
                    valueDelta.contributorCount += 1;
                    valueDelta.totalDelta += delta;
                } else {
                    values.set(value, {
                        contributorCount: 1,
                        totalDelta: delta,
                    });
                }
            }

            values.forEach(((valueDelta, value) => {
                if(valueDelta.contributorCount == 1) {
                    value.v += valueDelta.totalDelta;
                } else {
                    let scaledDelta = valueDelta.totalDelta / (2 + valueDelta.contributorCount);
                    value.v += scaledDelta;
                }
            }));

            count += 1;
        }
    }

    private addEqualAndMerge(newRelation: RelationEqual) {
        let mergedVariables = newRelation.variables;

        for(let relation of this.relations) {
            if(relation instanceof RelationEqual) {
                if(RelationManager.doArraysIntersect(relation.variables, newRelation.variables)) {
                    for(let v of relation.variables) {
                        if(mergedVariables.indexOf(v) == -1) {
                            mergedVariables.push(v);
                        }
                    }
                    let index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                }
            }
        }

        this.relations.push(newRelation);
    }

    private addColinearAndMerge(newRelation: RelationColinearPoints) {
        let mergedPoints = newRelation.points;

        for(let relation of this.relations) {
            if(relation instanceof RelationColinearPoints) {
                if(RelationManager.doArraysIntersect(relation.points, newRelation.points)) {
                    for(let p of relation.points) {
                        if(mergedPoints.indexOf(p) == -1) {
                            mergedPoints.push(p);
                            newRelation.variables.push(p._x);
                            newRelation.variables.push(p._y);
                        }
                    }
                    let index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                }
            }
        }

        this.relations.push(newRelation);
    }

    private addPointsOnCircleAndMerge(newRelation: RelationPointsOnCircle) {
        let mergedPoints = newRelation.points;

        for(let relation of this.relations) {
            if(relation instanceof RelationPointsOnCircle) {
                if(relation.circle == newRelation.circle) {
                    for(let p of relation.points) {
                        if(mergedPoints.indexOf(p) == -1) {
                            mergedPoints.push(p);
                            newRelation.variables.push(p._x);
                            newRelation.variables.push(p._y);
                        }
                    }
                    let index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                    // Assuming good merging, there will be at most
                    // one other relation with the same circle
                    break;
                }
            }
        }

        this.relations.push(newRelation);
    }

    private addEqualLengthAndMerge(newRelation: RelationEqualLength) {
        let mergedLines = newRelation.lines;

        for(let relation of this.relations) {
            if(relation instanceof RelationEqualLength) {
                if(RelationManager.doArraysIntersect(relation.lines, newRelation.lines)) {
                    for(let l of relation.lines) {
                        if(mergedLines.indexOf(l) == -1) {
                            mergedLines.push(l);
                            newRelation.variables.push(l.p0._x);
                            newRelation.variables.push(l.p0._y);
                            newRelation.variables.push(l.p1._x);
                            newRelation.variables.push(l.p1._y);
                        }
                    }
                    let index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                }
            }
        }

        this.relations.push(newRelation);
    }

    private addRelationAndMerge(relation: Relation) {
        if(relation instanceof RelationEqual) {
            this.addEqualAndMerge(relation);
        } else if(relation instanceof RelationColinearPoints) {
            this.addColinearAndMerge(relation);
        } else if(relation instanceof RelationPointsOnCircle) {
            this.addPointsOnCircleAndMerge(relation);
        } else if(relation instanceof RelationEqualLength) {
            this.addEqualLengthAndMerge(relation);
        } else {
            // no known merger
            this.relations.push(relation);
        }
    }

    addRelations(...relations: Relation[]) {
        for(let relation of relations) {
            this.addRelationAndMerge(relation);
        }
    }

    private removeRelation(relation: Relation) {
        let index = this.relations.indexOf(relation);
        if(index === -1) return;
        this.relations.splice(index, 1);
        relation.remove();
    }

    removeRelations(...relations: Relation[]) {
        for(let relation of relations) {
            this.removeRelation(relation);
        }
    }

    /**
     * Are there any values in both array0 and array1
     * @param array0
     * @param array1
     */
    static doArraysIntersect(array0: any[], array1: any[]) {
        if(array0.length == 0 || array1.length == 0) return false;
        for(let v0 of array0) {
            if(array1.indexOf(v0) != -1) return true;
        }
        return false;
    }

}