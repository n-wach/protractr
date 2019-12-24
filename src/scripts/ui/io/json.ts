/**
 * @module gcs/io
 */
/** */

import {Exporter, Importer} from "./io";
import Sketch from "../../gcs/sketch";
import Variable from "../../gcs/variable";
import Point from "../../gcs/geometry/point";
import Line from "../../gcs/geometry/line";
import Circle from "../../gcs/geometry/circle";
import Figure from "../../gcs/geometry/figure";
import Relation from "../../gcs/relations/relation";
import RelationEqual from "../../gcs/relations/relationEqual";
import RelationColinearPoints from "../../gcs/relations/relationColinearPoints";
import RelationEqualLength from "../../gcs/relations/relationEqualLength";
import RelationMidpoint from "../../gcs/relations/relationMidpoint";
import RelationTangentCircle from "../../gcs/relations/relationTangentCircle";
import RelationTangentLine from "../../gcs/relations/relationTangentLine";
import RelationPointsOnCircle from "../../gcs/relations/relationPointsOnCircle";

type JSONFigure = {
    type: string,
    [a: string]: any,
}

type JSONRelation = {
    type: string,
    [a: string]: any,
}

type JSONSketch = {
    variables: number[], // values
    points: [number, number][], // points made out of values
    figures: JSONFigure[], // figures made out of points and values
    relations: JSONRelation[] // relations made out of figures, points, and values
};

export class JSONImporter implements Importer {
    variables: Variable[];
    figures: Figure[];
    points: Point[];
    relations: Relation[];

    stringToSketch(str: string): Sketch {
        let obj = (JSON.parse(str) as JSONSketch);

        this.variables = [];
        for(let v of obj.variables) {
            this.variables.push(new Variable(v));
        }

        this.points = [];
        for(let v of obj.points) {
            let point = new Point(0, 0);
            point._x = this.variables[v[0]];
            point._y = this.variables[v[1]];
            this.points.push(point);
        }

        this.figures = [];
        for(let f of obj.figures) {
            this.figures.push(this.decodeF(f));
        }

        this.relations = [];
        for(let r of obj.relations) {
            this.relations.push(this.decodeR(r));
        }

        let sketch = new Sketch();
        sketch.figures = this.figures;
        sketch.relationManager.relations = this.relations;
        return sketch;
    }

    private decodeF(obj: JSONFigure) {
        if(obj.type == "point") {
            return this.points[obj.p];
        } else if (obj.type == "line") {
            let line = new Line(new Point(0, 0), new Point(0, 0));
            line.p0 = this.points[obj.p0];
            line.p1 = this.points[obj.p1];
            return line;
        } else if (obj.type == "circle")  {
            let circle = new Circle(new Point(0, 0), 0);
            circle.c = this.points[obj.c];
            circle._r = this.variables[obj.r];
            return circle;
        }
    }

    private decodeR(obj: JSONRelation): Relation {
        if(obj.type == "equal") {
            let variables: Variable[] = [];
            for(let v of obj.variables) {
                variables.push(this.variables[v]);
            }
            return new RelationEqual(obj.name, ...variables);
        } else if (obj.type == "colinear points") {
            let points = [];
            for(let p of obj.points) {
                points.push(this.points[p]);
            }
            return new RelationColinearPoints(...points);
        } else if (obj.type == "equal length") {
            let lines = [];
            for(let l of obj.lines) {
                lines.push(this.figures[l]);
            }
            return new RelationEqualLength(...lines);
        } else if (obj.type == "midpoint") {
            let line = (this.figures[obj.line] as Line);
            let midpoint = this.points[obj.midpoint];
            return new RelationMidpoint(midpoint, line);
        } else if (obj.type == "points on circle") {
            let points = [];
            for(let p of obj.points) {
                points.push(this.points[p]);
            }
            let circle = (this.figures[obj.circle] as Circle);
            return new RelationPointsOnCircle(circle, ...points);
        } else if (obj.type == "tangent circle") {
            let circle0 = (this.figures[obj.circle0] as Circle);
            let circle1 = (this.figures[obj.circle1] as Circle);
            return new RelationTangentCircle(circle0, circle1);
        } else if (obj.type == "tangent line") {
            let circle = (this.figures[obj.circle] as Circle);
            let line = (this.figures[obj.line] as Line);
            return new RelationTangentLine(line, circle);
        }
    }
}
export class JSONExporter implements Exporter {
    variables: Variable[];
    figures: Figure[];
    points: Point[];

    getFilename(): string {
        return "sketch.json";
    }

    sketchToString(sketch: Sketch): string {
        let obj: JSONSketch = {
            variables: [], // values
            points: [], // points made out of values
            figures: [], // figures made out of points and values
            relations: [] // relations made out of figures, points, and values
        };
        this.variables = [];
        this.figures = [];
        this.points = [];

        // save values
        for(let figure of sketch.figures) {
            this.variables.push(...this.getFigureVariables(figure));
        }
        for(let variable of this.variables) {
            obj.variables.push(variable.v);
        }

        // save points
        for(let figure of sketch.figures) {
            this.points.push(...this.getPoints(figure));
        }
        for(let point of this.points) {
            obj.points.push([this.encodeV(point._x), this.encodeV(point._y)]);
        }

        // save figures
        this.figures = sketch.figures;
        for(let figure of this.figures) {
            obj.figures.push(this.encodeFigure(figure));
        }

        // save relations
        for(let relation of sketch.relationManager.relations) {
            obj.relations.push(this.encodeRelation(relation));
        }

        return JSON.stringify(obj);
    }

    private encodeRelation(relation: Relation) {
        if(relation instanceof RelationEqual) {
            let variables = [];
            for(let v of relation.variables) {
                variables.push(this.encodeV(v));
            }
            return {
                type: "equal",
                name: relation.name,
                variables: variables,
            }
        } else if (relation instanceof RelationColinearPoints) {
            let points = [];
            for(let p of relation.points) {
                points.push(this.encodeP(p));
            }
            return {
                type: "colinear points",
                points: points,
            }
        } else if (relation instanceof RelationEqualLength) {
            let lines = [];
            for(let l of relation.lines) {
                lines.push(this.encodeF(l));
            }
            return {
                type: "equal length",
                lines: lines,
            }
        } else if (relation instanceof RelationMidpoint) {
            return {
                type: "midpoint",
                line: this.encodeF(relation.line),
                midpoint: this.encodeF(relation.midpoint),
            }
        } else if (relation instanceof RelationPointsOnCircle) {
            let points = [];
            for(let p of relation.points) {
                points.push(this.encodeP(p));
            }
            return {
                type: "points on circle",
                points: points,
                circle: this.encodeF(relation.circle),
            }
        } else if (relation instanceof RelationTangentCircle) {
            return {
                type: "tangent circle",
                circle0: this.encodeF(relation.circle0),
                circle1: this.encodeF(relation.circle1),
            }
        } else if (relation instanceof RelationTangentLine) {
            return {
                type: "tangent line",
                line: this.encodeF(relation.line),
                circle: this.encodeF(relation.circle),
            }
        }
    }

    private getPoints(figure: Figure): Point[] {
        if(figure instanceof Point) {
            return [figure];
        } else if (figure instanceof Line) {
            return [figure.p0, figure.p1];
        } else if (figure instanceof Circle) {
            return [figure.c];
        }
    }

    private encodeFigure(figure: Figure) {
        if(figure instanceof Point) {
            return {
                type: "point",
                p: this.encodeP(figure),
            };
        } else if (figure instanceof Line) {
            return {
                type: "line",
                p0: this.encodeP(figure.p0),
                p1: this.encodeP(figure.p1),
            };
        } else if (figure instanceof Circle) {
            return {
                type: "circle",
                c: this.encodeP(figure.c),
                r: this.encodeV(figure._r),
            };
        }
    }

    private getFigureVariables(figure: Figure): Variable[] {
        if(figure instanceof Point) {
            return [figure._x, figure._y];
        } else if (figure instanceof Line) {
            return [figure.p0._x, figure.p0._y, figure.p1._x, figure.p1._y];
        } else if (figure instanceof Circle) {
            return [figure.c._x, figure.c._y, figure._r];
        }
    }

    private encodeV(variable: Variable): number {
        return this.variables.indexOf(variable);
    }

    private encodeF(figure: Figure): number {
        return this.figures.indexOf(figure);
    }

    private encodeP(point: Point): number {
        return this.points.indexOf(point);
    }
}