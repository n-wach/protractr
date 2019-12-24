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

export default class RelationPointsOnCircle extends Relation {
    variables: Variable[];
    points: Point[];
    circle: Circle;

    constructor(circle: Circle, ...points: Point[]) {
        super();
        this.variables = [
            circle._r,
            circle.c._x,
            circle.c._y,
        ];
        for(let point of points) {
            this.variables.push(point._x);
            this.variables.push(point._y);
        }
        this.points = points;
        this.circle = circle;
    }

    getDeltas(): VariableDelta[] {
        let deltas: VariableDelta[] = [];

        let totalDistance = 0;
        let centerXDelta = 0;
        let centerYDelta = 0;
        for(let point of this.points) {
            let dist = Util.distanceBetweenPoints(point, this.circle.c);
            totalDistance += dist;

            let goalPoint = Util.projectOntoCircle(this.circle, point);
            deltas.push(...Util.pointDeltas(point, goalPoint));

            if (dist == 0) continue;
            let d = this.circle.r / dist;

            let dx = point.x - this.circle.c.x;
            let dy = point.y - this.circle.c.y;

            centerXDelta += (1 - d) * dx;
            centerYDelta += (1 - d) * dy;
        }

        let averageRadius = totalDistance / this.points.length;

        let dr = averageRadius - this.circle.r;

        deltas.push([this.circle._r, dr]);

        deltas.push([this.circle.c._x, centerXDelta]);
        deltas.push([this.circle.c._y, centerYDelta]);

        return deltas;
    }

    getError(): number {
        let error = 0;
        for(let point of this.points) {
            error += Util.distanceToCircle(this.circle, point);
        }
        return error;
    }

    getVariables(): Variable[] {
        return this.variables;
    }

    containsFigure(figure: Figure): boolean {
        if(figure instanceof Line) return false;
        return super.containsFigure(figure);
    }
}