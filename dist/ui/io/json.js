"use strict";
/**
 * @module gcs/io
 */
/** */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var sketch_1 = require("../../gcs/sketch");
var variable_1 = require("../../gcs/variable");
var point_1 = require("../../gcs/geometry/point");
var line_1 = require("../../gcs/geometry/line");
var circle_1 = require("../../gcs/geometry/circle");
var relationEqual_1 = require("../../gcs/relations/relationEqual");
var relationColinearPoints_1 = require("../../gcs/relations/relationColinearPoints");
var relationEqualLength_1 = require("../../gcs/relations/relationEqualLength");
var relationMidpoint_1 = require("../../gcs/relations/relationMidpoint");
var relationTangentCircle_1 = require("../../gcs/relations/relationTangentCircle");
var relationTangentLine_1 = require("../../gcs/relations/relationTangentLine");
var relationPointsOnCircle_1 = require("../../gcs/relations/relationPointsOnCircle");
var arc_1 = require("../../gcs/geometry/arc");
var JSONImporter = /** @class */ (function () {
    function JSONImporter() {
    }
    JSONImporter.prototype.stringToSketch = function (str) {
        var obj = JSON.parse(str);
        this.variables = [];
        for (var _i = 0, _a = obj.variables; _i < _a.length; _i++) {
            var v = _a[_i];
            this.variables.push(new variable_1.default(v));
        }
        this.points = [];
        for (var _b = 0, _c = obj.points; _b < _c.length; _b++) {
            var v = _c[_b];
            var point = new point_1.default(0, 0);
            point._x = this.variables[v[0]];
            point._y = this.variables[v[1]];
            point.label = v[2];
            point.labelPosition = v[3];
            this.points.push(point);
        }
        this.figures = [];
        for (var _d = 0, _e = obj.figures; _d < _e.length; _d++) {
            var f = _e[_d];
            this.figures.push(this.decodeF(f));
        }
        this.relations = [];
        for (var _f = 0, _g = obj.relations; _f < _g.length; _f++) {
            var r = _g[_f];
            this.relations.push(this.decodeR(r));
        }
        var sketch = new sketch_1.default();
        sketch.figures = this.figures;
        sketch.relationManager.relations = this.relations;
        return sketch;
    };
    JSONImporter.prototype.decodeF = function (obj) {
        if (obj.type == "point") {
            return this.points[obj.p];
        }
        else if (obj.type == "line") {
            var line = new line_1.default(new point_1.default(0, 0), new point_1.default(0, 0));
            line.p0 = this.points[obj.p0];
            line.p1 = this.points[obj.p1];
            return line;
        }
        else if (obj.type == "arc") {
            var arc = new arc_1.default(new point_1.default(0, 0), 0, 0, 0);
            arc.c = this.points[obj.c];
            arc._r = this.variables[obj.r];
            var p0 = new arc_1.ArcPoint(arc, 0, 0);
            p0._x = this.points[obj.p0]._x;
            p0._y = this.points[obj.p0]._y;
            this.points[obj.p0] = p0;
            arc.p0 = p0;
            var p1 = new arc_1.ArcPoint(arc, 0, 0);
            p1._x = this.points[obj.p1]._x;
            p1._y = this.points[obj.p1]._y;
            this.points[obj.p1] = p1;
            arc.p1 = p1;
            return arc;
        }
        else if (obj.type == "circle") {
            var circle = new circle_1.default(new point_1.default(0, 0), 0);
            circle.c = this.points[obj.c];
            circle._r = this.variables[obj.r];
            return circle;
        }
    };
    JSONImporter.prototype.decodeR = function (obj) {
        if (obj.type == "equal") {
            var variables = [];
            for (var _i = 0, _a = obj.variables; _i < _a.length; _i++) {
                var v = _a[_i];
                variables.push(this.variables[v]);
            }
            return new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, obj.name], variables)))();
        }
        else if (obj.type == "colinear points") {
            var points = [];
            for (var _b = 0, _c = obj.points; _b < _c.length; _b++) {
                var p = _c[_b];
                points.push(this.points[p]);
            }
            return new (relationColinearPoints_1.default.bind.apply(relationColinearPoints_1.default, __spreadArrays([void 0], points)))();
        }
        else if (obj.type == "equal length") {
            var lines = [];
            for (var _d = 0, _e = obj.lines; _d < _e.length; _d++) {
                var l = _e[_d];
                lines.push(this.figures[l]);
            }
            return new (relationEqualLength_1.default.bind.apply(relationEqualLength_1.default, __spreadArrays([void 0], lines)))();
        }
        else if (obj.type == "midpoint") {
            var line = this.figures[obj.line];
            var midpoint = this.points[obj.midpoint];
            return new relationMidpoint_1.default(midpoint, line);
        }
        else if (obj.type == "points on circle") {
            var points = [];
            for (var _f = 0, _g = obj.points; _f < _g.length; _f++) {
                var p = _g[_f];
                points.push(this.points[p]);
            }
            var circle = this.figures[obj.circle];
            return new (relationPointsOnCircle_1.default.bind.apply(relationPointsOnCircle_1.default, __spreadArrays([void 0, circle], points)))();
        }
        else if (obj.type == "tangent circle") {
            var circle0 = this.figures[obj.circle0];
            var circle1 = this.figures[obj.circle1];
            return new relationTangentCircle_1.default(circle0, circle1);
        }
        else if (obj.type == "tangent line") {
            var circle = this.figures[obj.circle];
            var line = this.figures[obj.line];
            return new relationTangentLine_1.default(line, circle);
        }
    };
    return JSONImporter;
}());
exports.JSONImporter = JSONImporter;
var JSONExporter = /** @class */ (function () {
    function JSONExporter() {
    }
    JSONExporter.prototype.getFilename = function () {
        return "sketch.json";
    };
    JSONExporter.prototype.sketchToString = function (sketch) {
        var _a, _b;
        var obj = {
            variables: [],
            points: [],
            figures: [],
            relations: [] // relations made out of figures, points, and values
        };
        this.variables = [];
        this.figures = [];
        this.points = [];
        // save values
        for (var _i = 0, _c = sketch.figures; _i < _c.length; _i++) {
            var figure = _c[_i];
            (_a = this.variables).push.apply(_a, this.getFigureVariables(figure));
        }
        for (var _d = 0, _e = this.variables; _d < _e.length; _d++) {
            var variable = _e[_d];
            obj.variables.push(variable.v);
        }
        // save points
        for (var _f = 0, _g = sketch.figures; _f < _g.length; _f++) {
            var figure = _g[_f];
            (_b = this.points).push.apply(_b, this.getPoints(figure));
        }
        for (var _h = 0, _j = this.points; _h < _j.length; _h++) {
            var point = _j[_h];
            obj.points.push([this.encodeV(point._x), this.encodeV(point._y), point.label, point.labelPosition]);
        }
        // save figures
        this.figures = sketch.figures;
        for (var _k = 0, _l = this.figures; _k < _l.length; _k++) {
            var figure = _l[_k];
            obj.figures.push(this.encodeFigure(figure));
        }
        // save relations
        for (var _m = 0, _o = sketch.relationManager.relations; _m < _o.length; _m++) {
            var relation = _o[_m];
            obj.relations.push(this.encodeRelation(relation));
        }
        return JSON.stringify(obj);
    };
    JSONExporter.prototype.encodeRelation = function (relation) {
        if (relation instanceof relationEqual_1.default) {
            var variables = [];
            for (var _i = 0, _a = relation.variables; _i < _a.length; _i++) {
                var v = _a[_i];
                variables.push(this.encodeV(v));
            }
            return {
                type: "equal",
                name: relation.name,
                variables: variables,
            };
        }
        else if (relation instanceof relationColinearPoints_1.default) {
            var points = [];
            for (var _b = 0, _c = relation.points; _b < _c.length; _b++) {
                var p = _c[_b];
                points.push(this.encodeP(p));
            }
            return {
                type: "colinear points",
                points: points,
            };
        }
        else if (relation instanceof relationEqualLength_1.default) {
            var lines = [];
            for (var _d = 0, _e = relation.lines; _d < _e.length; _d++) {
                var l = _e[_d];
                lines.push(this.encodeF(l));
            }
            return {
                type: "equal length",
                lines: lines,
            };
        }
        else if (relation instanceof relationMidpoint_1.default) {
            return {
                type: "midpoint",
                line: this.encodeF(relation.line),
                midpoint: this.encodeP(relation.midpoint),
            };
        }
        else if (relation instanceof relationPointsOnCircle_1.default) {
            var points = [];
            for (var _f = 0, _g = relation.points; _f < _g.length; _f++) {
                var p = _g[_f];
                points.push(this.encodeP(p));
            }
            return {
                type: "points on circle",
                points: points,
                circle: this.encodeF(relation.circle),
            };
        }
        else if (relation instanceof relationTangentCircle_1.default) {
            return {
                type: "tangent circle",
                circle0: this.encodeF(relation.circle0),
                circle1: this.encodeF(relation.circle1),
            };
        }
        else if (relation instanceof relationTangentLine_1.default) {
            return {
                type: "tangent line",
                line: this.encodeF(relation.line),
                circle: this.encodeF(relation.circle),
            };
        }
    };
    JSONExporter.prototype.getPoints = function (figure) {
        if (figure instanceof point_1.default) {
            return [figure];
        }
        else if (figure instanceof line_1.default) {
            return [figure.p0, figure.p1];
        }
        else if (figure instanceof arc_1.default) {
            return [figure.c, figure.p0, figure.p1];
        }
        else if (figure instanceof circle_1.default) {
            return [figure.c];
        }
    };
    JSONExporter.prototype.encodeFigure = function (figure) {
        if (figure instanceof point_1.default) {
            var d = {
                type: "point",
                p: this.encodeP(figure)
            };
            if (figure.label && figure.labelPosition) {
                d["label"] = figure.label;
                d["labelPosition"] = figure.labelPosition;
            }
            return d;
        }
        else if (figure instanceof line_1.default) {
            return {
                type: "line",
                p0: this.encodeP(figure.p0),
                p1: this.encodeP(figure.p1),
            };
        }
        else if (figure instanceof arc_1.default) {
            return {
                type: "arc",
                c: this.encodeP(figure.c),
                r: this.encodeV(figure._r),
                p0: this.encodeP(figure.p0),
                p1: this.encodeP(figure.p1),
            };
        }
        else if (figure instanceof circle_1.default) {
            return {
                type: "circle",
                c: this.encodeP(figure.c),
                r: this.encodeV(figure._r),
            };
        }
    };
    JSONExporter.prototype.getFigureVariables = function (figure) {
        if (figure instanceof point_1.default) {
            return [figure._x, figure._y];
        }
        else if (figure instanceof line_1.default) {
            return [figure.p0._x, figure.p0._y, figure.p1._x, figure.p1._y];
        }
        else if (figure instanceof arc_1.default) {
            return [figure.c._x, figure.c._y, figure._r, figure.p0._x, figure.p0._y, figure.p1._x, figure.p1._y];
        }
        else if (figure instanceof circle_1.default) {
            return [figure.c._x, figure.c._y, figure._r];
        }
    };
    JSONExporter.prototype.encodeV = function (variable) {
        return this.variables.indexOf(variable);
    };
    JSONExporter.prototype.encodeF = function (figure) {
        return this.figures.indexOf(figure);
    };
    JSONExporter.prototype.encodeP = function (point) {
        return this.points.indexOf(point);
    };
    return JSONExporter;
}());
exports.JSONExporter = JSONExporter;
//# sourceMappingURL=json.js.map