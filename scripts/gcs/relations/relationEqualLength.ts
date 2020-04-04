/**
 * @module gcs/relations
 */
/** */

import Relation, {VariableDelta} from "./relation";
import Variable from "../variable";
import Line from "../geometry/line";
import Util from "../geometry/util";

export default class RelationEqualLength extends Relation {
    variables: Variable[];
    lines: Line[];

    constructor(...lines: Line[]) {
        super("equal length");
        this.variables = [];
        for(let line of lines) {
            this.variables.push(line.p0._x);
            this.variables.push(line.p0._y);
            this.variables.push(line.p1._x);
            this.variables.push(line.p1._y);
        }
        this.lines = lines;
    }

    getDeltas(): VariableDelta[] {
        let deltas: VariableDelta[] = [];

        let goalLength = this.getGoalLength();
        for(let line of this.lines) {
            let p0Goal = Util.pointInDirection(line.p1, line.p0, goalLength);
            let p1Goal = Util.pointInDirection(line.p0, line.p1, goalLength);

            deltas.push(...Util.pointDeltas(line.p0, p0Goal));
            deltas.push(...Util.pointDeltas(line.p1, p1Goal));
        }

        return deltas;
    }

    getGoalLength(): number {
        let sumDist = 0;
        for(let line of this.lines) {
            let len = Util.lengthOfLine(line);
            if(line.p0._x.constant &&
                line.p0._y.constant &&
                line.p1._x.constant &&
                line.p1._y.constant) {
                return len;
            }
            sumDist += len;
        }
        return sumDist / this.lines.length;
    }

    getError(): number {
        let error = 0;
        let goal = this.getGoalLength();
        for(let line of this.lines) {
            let len = Util.lengthOfLine(line);
            error += Math.abs(goal - len);
        }
        return error;
    }

    getVariables(): Variable[] {
        return this.variables;
    }
}