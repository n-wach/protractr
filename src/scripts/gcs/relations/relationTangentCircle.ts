/**
 * @module gcs/relations
 */
/** */

import Relation, {VariableDelta} from "./relation";
import Variable from "../variable";
import Point from "../geometry/point";
import Circle from "../geometry/circle";
import Figure from "../geometry/figure";
import Line from "../geometry/line";
import Util from "../geometry/util";

export default class RelationTangentCircle extends Relation {
    variables: Variable[];
    circle0: Circle;
    circle1: Circle;

    constructor(circle0: Circle, circle1: Circle) {
        super();
        this.variables = [
            circle0._r,
            circle0.c._x,
            circle0.c._y,
            circle1._r,
            circle1.c._x,
            circle1.c._y,
        ];
        this.circle0 = circle0;
        this.circle1 = circle1;
    }

    getDeltas(): VariableDelta[] {
        let deltas: VariableDelta[] = [];
        let delta = 0;

        let dist = Util.distanceBetweenPoints(this.circle0.c, this.circle1.c);
        if(dist > Math.max(this.circle0.r, this.circle1.r)) {
            // circle centers are outside of each other
            let radiusSum = this.circle0.r + this.circle1.r;
            delta = dist - radiusSum;
            deltas.push([this.circle0._r, delta]);
            deltas.push([this.circle1._r, delta]);
        } else {
            // the circle with the smaller radius is inside the other circle
            if(this.circle0.r < this.circle1.r) {
                //circle0 inside circle1
                delta = this.circle1.r - (dist - this.circle0.r);
                deltas.push([this.circle0._r, -delta]);
                deltas.push([this.circle1._r, delta]);
            } else {
                //circle1 inside circle0
                delta = this.circle0.r - (dist - this.circle1.r);
                deltas.push([this.circle0._r, delta]);
                deltas.push([this.circle1._r, -delta]);
            }
        }

        let c0Goal = Util.pointInDirection(this.circle0.c, this.circle1.c, delta);
        let c1Goal = Util.pointInDirection(this.circle1.c, this.circle0.c, delta);

        deltas.push(...Util.pointDeltas(this.circle0.c, c0Goal));
        deltas.push(...Util.pointDeltas(this.circle1.c, c1Goal));

        return deltas;
    }

    getError(): number {
        let dist = Util.distanceBetweenPoints(this.circle0.c, this.circle1.c);
        if(dist > Math.max(this.circle0.r, this.circle1.r)) {
            // circle centers are outside of each other
            let radiusSum = this.circle0.r + this.circle1.r;
            return Math.abs(dist - radiusSum);
        } else {
            // the circle with the smaller radius is inside the other circle
            if(this.circle0.r < this.circle1.r) {
                //circle0 inside circle1
                return Math.abs(this.circle1.r - (dist - this.circle0.r));
            } else {
                //circle1 inside circle0
                return Math.abs(this.circle0.r - (dist - this.circle1.r));
            }
        }
    }

    getVariables(): Variable[] {
        return this.variables;
    }

    containsFigure(figure: Figure): boolean {
        if(figure instanceof Point) return false;
        if(figure instanceof Line) return false;
        return super.containsFigure(figure);
    }
}