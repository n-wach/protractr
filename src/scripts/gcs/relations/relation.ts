/**
 * @module gcs/relations
 */
/** */

import Variable from "../variable";
import Figure from "../geometry/figure";
import Point from "../geometry/point";
import Line from "../geometry/line";
import Circle from "../geometry/circle";

export type VariableDelta = [Variable, number];

export default abstract class Relation {
    name: string = "abstract relation";
    protected constructor(name?: string) {
        this.name = name;
    }
    abstract getError(): number;
    abstract getDeltas(): VariableDelta[];
    abstract getVariables(): Variable[];
    containsVariable(variable: Variable): boolean {
        return this.getVariables().indexOf(variable) !== -1;
    }
    containsFigure(figure: Figure): boolean {
        if(figure instanceof Point) {
            return this.containsVariable(figure._x) || this.containsVariable(figure._y);
        } else if(figure instanceof Line) {
            return this.containsFigure(figure.p0) && this.containsFigure(figure.p1);
        } else if(figure instanceof Circle) {
            return this.containsVariable(figure._r);
        }
        return false;
    }
    remove() {
        // usually do nothing...
    }
}
