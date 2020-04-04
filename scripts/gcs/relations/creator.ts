/**
 * @module gcs/relations
 */
/** */

import FilterString from "../filterString";
import Relation from "./relation";
import Point from "../geometry/point";
import Line from "../geometry/line";
import Circle from "../geometry/circle";
import Figure from "../geometry/figure";
import RelationEqual from "./relationEqual";
import Variable from "../variable";
import RelationPointsOnCircle from "./relationPointsOnCircle";
import RelationColinearPoints from "./relationColinearPoints";
import RelationEqualLength from "./relationEqualLength";
import RelationTangentCircle from "./relationTangentCircle";
import RelationTangentLine from "./relationTangentLine";
import RelationMidpoint from "./relationMidpoint";

type SortedFigureSelection = {
    point: Point[],
    line: Line[],
    circle: Circle[],
};

export type RelationEnvironment = {
    name: string,
    filter: FilterString,
    create: (figures: SortedFigureSelection) => Relation[],
}

export default class RelationCreator {
    static environments: RelationEnvironment[] = [
        { //Horizontal points
            name: "horizontal",
            filter: new FilterString(":2+point"),
            create: function(figures) {
                let ys: Variable[] = [];
                for(let point of figures.point) {
                    ys.push(point._y);
                }
                return [new RelationEqual("horizontal", ...ys)];
            }
        },
        { //Vertical points
            name: "vertical",
            filter: new FilterString(":2+point"),
            create: function(figures) {
                let xs: Variable[] = [];
                for(let point of figures.point) {
                    xs.push(point._x);
                }
                return [new RelationEqual("vertical", ...xs)];
            }
        },
        { //Horizontal lines
            name: "horizontal",
            filter: new FilterString(":1+line"),
            create: function(figures) {
                let relations: RelationEqual[] = [];
                for(let line of figures.line) {
                    relations.push(new RelationEqual("horizontal", line.p0._y, line.p1._y));
                }
                return relations;
            }
        },
        { //Vertical lines
            name: "vertical",
            filter: new FilterString(":1+line"),
            create: function(figures) {
                let relations: RelationEqual[] = [];
                for(let line of figures.line) {
                    relations.push(new RelationEqual("vertical", line.p0._x, line.p1._x));
                }
                return relations;
            }
        },
        { //Coincident point
            name: "coincident",
            filter: new FilterString(":2+point"),
            create: function(figures) {
                let xs: Variable[] = [];
                let ys: Variable[] = [];
                for(let point of figures.point) {
                    xs.push(point._x);
                    ys.push(point._y);
                }
                return [
                    new RelationEqual("vertical", ...xs),
                    new RelationEqual("horizontal", ...ys),
                ];
            }
        },
        { //Equal radius
            name: "equal radius",
            filter: new FilterString(":2+circle"),
            create: function(figures) {
                let rs: Variable[] = [];
                for(let circle of figures.circle) {
                    rs.push(circle._r);
                }
                return [new RelationEqual("equal radius", ...rs)];
            }
        },
        { //Concentric
            name: "concentric",
            filter: new FilterString(":2+circle,1+circle&*point"),
            create: function(figures) {
                let xs: Variable[] = [];
                let ys: Variable[] = [];
                for(let circle of figures.circle) {
                    xs.push(circle.c._x);
                    ys.push(circle.c._y);
                }
                for(let point of figures.point) {
                    xs.push(point._x);
                    ys.push(point._y);
                }
                return [
                    new RelationEqual("vertical", ...xs),
                    new RelationEqual("horizontal", ...ys)
                ];
            }
        },
        { //Point on circle
            name: "point on circle",
            filter: new FilterString(":circle&1+point"),
            create: function(figures) {
                return [new RelationPointsOnCircle(figures.circle[0], ...figures.point)];
            }
        },
        { //Intersection between circles
            name: "circle intersection",
            filter: new FilterString(":point&2+circle"),
            create: function(figures) {
                let p = figures.point[0];
                let relations = [];
                for(let circle of figures.circle) {
                    relations.push(new RelationPointsOnCircle(circle, p));
                }
                return relations;
            }
        },
        { //Co-linear points
            name: "colinear",
            filter: new FilterString("line as 2 point:3+point"),
            create: function(figures) {
                let points = figures.point;
                for(let line of figures.line) {
                    points.push(line.p0);
                    points.push(line.p1);
                }
                return [new RelationColinearPoints(...points)];
            }
        },
        { //Midpoint
            name: "midpoint",
            filter: new FilterString(":point&line"),
            create: function(figures) {
                return [new RelationMidpoint(figures.point[0], figures.line[0])];
            }
        },
        { //Intersection between lines
            name: "line intersection",
            filter: new FilterString(":point&2+line"),
            create: function(figures) {
                let p = figures.point[0];
                let relations = [];
                for(let line of figures.line) {
                    relations.push(new RelationColinearPoints(p, line.p0, line.p1));
                }
                return relations;
            }
        },
        { //Equal length lines
            name: "equal length",
            filter: new FilterString(":2+line"),
            create: function(figures) {
                return [new RelationEqualLength(...figures.line)];
            }
        },
        { //Tangent Circles
            name: "tangent circles",
            filter: new FilterString(":2circle"),
            create: function(figures) {
                return [new RelationTangentCircle(figures.circle[0], figures.circle[1])];
            }
        },
        { //Tangent Line
            name: "tangent line",
            filter: new FilterString(":1circle&1line"),
            create: function(figures) {
                return [new RelationTangentLine(figures.line[0], figures.circle[0])];
            }
        },
    ];

    static getSatisfiedEnvironments(figures: Figure[]): RelationEnvironment[] {
        let satisfied = [];
        for(let env of this.environments) {
            if(env.filter.satisfiesFilter(figures)) {
                satisfied.push(env);
            }
        }
        return satisfied;
    }

    static createRelations(figures: Figure[], relenv: RelationEnvironment) {
        let sorted = RelationCreator.sortFigureSelection(figures);
        return relenv.create(sorted);
    }

    static sortFigureSelection(figures: Figure[]): SortedFigureSelection {
        let sortedFigures: SortedFigureSelection = {
            point: [],
            line: [],
            circle: [],
        };
        for(let f of figures) {
            if(f instanceof Point) {
                sortedFigures.point.push(f);
            } else if(f instanceof Line) {
                sortedFigures.line.push(f);
            } else if(f instanceof Circle) {
                sortedFigures.circle.push(f);
            }
        }
        return sortedFigures;
    }

}