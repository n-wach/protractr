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

export default class RelationTangentLine extends Relation {
    variables: Variable[];
    line: Line;
    circle: Circle;

    constructor(line: Line, circle: Circle) {
        super();
        this.variables = [
            circle._r,
            circle.c._x,
            circle.c._y,
            line.p0._x,
            line.p0._y,
            line.p1._x,
            line.p1._y,
        ];
        this.line = line;
        this.circle = circle;
    }

    getDeltas(): VariableDelta[] {
        let deltas: VariableDelta[] = [];

        let projection = Util.projectOntoLine(this.line, this.circle.c);
        let projectionRadius = Util.distanceBetweenPoints(this.circle.c, projection);

        let dr = projectionRadius - this.circle.r;
        deltas.push([this.circle._r, dr]);

        let dx = projection.x - this.circle.c.x;
        let dy = projection.y - this.circle.c.y;
        let da = new Point(dx, dy);

        let normalized = Util.normalize(da);
        let offset = new Point(normalized.x * dr, normalized.y * dr);

        deltas.push([this.circle.c._x, offset.x]);
        deltas.push([this.circle.c._y, offset.y]);

        deltas.push([this.line.p0._x, -offset.x]);
        deltas.push([this.line.p0._y, -offset.y]);
        deltas.push([this.line.p1._x, -offset.x]);
        deltas.push([this.line.p1._y, -offset.y]);

        return deltas;
    }

    getError(): number {
        let projection = Util.projectOntoLine(this.line, this.circle.c);
        return Util.distanceToCircle(this.circle, projection);
    }

    getVariables(): Variable[] {
        return this.variables;
    }
}