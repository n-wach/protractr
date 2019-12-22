import Relation, {VariableDelta} from "./relation";
import Variable from "../variable";
import Point from "../geometry/point";
import Circle from "../geometry/circle";
import Figure from "../geometry/figure";
import Line from "../geometry/line";
import Util from "../geometry/util";

export default class RelationColinearPoints extends Relation {
    variables: Variable[];
    points: Point[];

    constructor(...points: Point[]) {
        super();
        this.variables = [];
        for(let point of points) {
            this.variables.push(point._x);
            this.variables.push(point._y);
        }
        this.points = points;
    }

    getDeltas(): VariableDelta[] {
        let deltas: VariableDelta[] = [];

        let regression = Util.forcedRegressionLine(...this.points);
        if(!regression) regression = Util.leastSquaresRegression(...this.points);

        for(let point of this.points) {
            let projection = Util.projectOntoLine(regression, point);
            deltas.push(...Util.pointDeltas(point, projection));
        }

        return deltas;
    }

    getError(): number {
        let regression = Util.forcedRegressionLine(...this.points);
        if(!regression) regression = Util.leastSquaresRegression(...this.points);

        let error = 0;
        for(let point of this.points) {
            error += Util.distanceToLine(regression, point);
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