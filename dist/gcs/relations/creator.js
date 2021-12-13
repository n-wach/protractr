"use strict";
/**
 * @module gcs/relations
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
var filterString_1 = require("../filterString");
var point_1 = require("../geometry/point");
var line_1 = require("../geometry/line");
var circle_1 = require("../geometry/circle");
var relationEqual_1 = require("./relationEqual");
var relationPointsOnCircle_1 = require("./relationPointsOnCircle");
var relationColinearPoints_1 = require("./relationColinearPoints");
var relationEqualLength_1 = require("./relationEqualLength");
var relationTangentCircle_1 = require("./relationTangentCircle");
var relationTangentLine_1 = require("./relationTangentLine");
var relationMidpoint_1 = require("./relationMidpoint");
var RelationCreator = /** @class */ (function () {
    function RelationCreator() {
    }
    RelationCreator.getSatisfiedEnvironments = function (figures) {
        var satisfied = [];
        for (var _i = 0, _a = this.environments; _i < _a.length; _i++) {
            var env = _a[_i];
            if (env.filter.satisfiesFilter(figures)) {
                satisfied.push(env);
            }
        }
        return satisfied;
    };
    RelationCreator.createRelations = function (figures, relenv) {
        var sorted = RelationCreator.sortFigureSelection(figures);
        return relenv.create(sorted);
    };
    RelationCreator.sortFigureSelection = function (figures) {
        var sortedFigures = {
            point: [],
            line: [],
            circle: [],
        };
        for (var _i = 0, figures_1 = figures; _i < figures_1.length; _i++) {
            var f = figures_1[_i];
            if (f instanceof point_1.default) {
                sortedFigures.point.push(f);
            }
            else if (f instanceof line_1.default) {
                sortedFigures.line.push(f);
            }
            else if (f instanceof circle_1.default) {
                sortedFigures.circle.push(f);
            }
        }
        return sortedFigures;
    };
    RelationCreator.environments = [
        {
            name: "horizontal",
            filter: new filterString_1.default(":2+point"),
            create: function (figures) {
                var ys = [];
                for (var _i = 0, _a = figures.point; _i < _a.length; _i++) {
                    var point = _a[_i];
                    ys.push(point._y);
                }
                return [new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "horizontal"], ys)))()];
            }
        },
        {
            name: "vertical",
            filter: new filterString_1.default(":2+point"),
            create: function (figures) {
                var xs = [];
                for (var _i = 0, _a = figures.point; _i < _a.length; _i++) {
                    var point = _a[_i];
                    xs.push(point._x);
                }
                return [new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "vertical"], xs)))()];
            }
        },
        {
            name: "horizontal",
            filter: new filterString_1.default(":1+line"),
            create: function (figures) {
                var relations = [];
                for (var _i = 0, _a = figures.line; _i < _a.length; _i++) {
                    var line = _a[_i];
                    relations.push(new relationEqual_1.default("horizontal", line.p0._y, line.p1._y));
                }
                return relations;
            }
        },
        {
            name: "vertical",
            filter: new filterString_1.default(":1+line"),
            create: function (figures) {
                var relations = [];
                for (var _i = 0, _a = figures.line; _i < _a.length; _i++) {
                    var line = _a[_i];
                    relations.push(new relationEqual_1.default("vertical", line.p0._x, line.p1._x));
                }
                return relations;
            }
        },
        {
            name: "coincident",
            filter: new filterString_1.default(":2+point"),
            create: function (figures) {
                var xs = [];
                var ys = [];
                for (var _i = 0, _a = figures.point; _i < _a.length; _i++) {
                    var point = _a[_i];
                    xs.push(point._x);
                    ys.push(point._y);
                }
                return [
                    new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "vertical"], xs)))(),
                    new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "horizontal"], ys)))(),
                ];
            }
        },
        {
            name: "equal radius",
            filter: new filterString_1.default(":2+circle"),
            create: function (figures) {
                var rs = [];
                for (var _i = 0, _a = figures.circle; _i < _a.length; _i++) {
                    var circle = _a[_i];
                    rs.push(circle._r);
                }
                return [new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "equal radius"], rs)))()];
            }
        },
        {
            name: "concentric",
            filter: new filterString_1.default(":2+circle,1+circle&*point"),
            create: function (figures) {
                var xs = [];
                var ys = [];
                for (var _i = 0, _a = figures.circle; _i < _a.length; _i++) {
                    var circle = _a[_i];
                    xs.push(circle.c._x);
                    ys.push(circle.c._y);
                }
                for (var _b = 0, _c = figures.point; _b < _c.length; _b++) {
                    var point = _c[_b];
                    xs.push(point._x);
                    ys.push(point._y);
                }
                return [
                    new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "vertical"], xs)))(),
                    new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "horizontal"], ys)))()
                ];
            }
        },
        {
            name: "point on circle",
            filter: new filterString_1.default(":circle&1+point"),
            create: function (figures) {
                return [new (relationPointsOnCircle_1.default.bind.apply(relationPointsOnCircle_1.default, __spreadArrays([void 0, figures.circle[0]], figures.point)))()];
            }
        },
        {
            name: "circle intersection",
            filter: new filterString_1.default(":point&2+circle"),
            create: function (figures) {
                var p = figures.point[0];
                var relations = [];
                for (var _i = 0, _a = figures.circle; _i < _a.length; _i++) {
                    var circle = _a[_i];
                    relations.push(new relationPointsOnCircle_1.default(circle, p));
                }
                return relations;
            }
        },
        {
            name: "colinear",
            filter: new filterString_1.default("line as 2 point:3+point"),
            create: function (figures) {
                var points = figures.point;
                for (var _i = 0, _a = figures.line; _i < _a.length; _i++) {
                    var line = _a[_i];
                    points.push(line.p0);
                    points.push(line.p1);
                }
                return [new (relationColinearPoints_1.default.bind.apply(relationColinearPoints_1.default, __spreadArrays([void 0], points)))()];
            }
        },
        {
            name: "midpoint",
            filter: new filterString_1.default(":point&line"),
            create: function (figures) {
                return [new relationMidpoint_1.default(figures.point[0], figures.line[0])];
            }
        },
        {
            name: "line intersection",
            filter: new filterString_1.default(":point&2+line"),
            create: function (figures) {
                var p = figures.point[0];
                var relations = [];
                for (var _i = 0, _a = figures.line; _i < _a.length; _i++) {
                    var line = _a[_i];
                    relations.push(new relationColinearPoints_1.default(p, line.p0, line.p1));
                }
                return relations;
            }
        },
        {
            name: "equal length",
            filter: new filterString_1.default(":2+line"),
            create: function (figures) {
                return [new (relationEqualLength_1.default.bind.apply(relationEqualLength_1.default, __spreadArrays([void 0], figures.line)))()];
            }
        },
        {
            name: "tangent circles",
            filter: new filterString_1.default(":2circle"),
            create: function (figures) {
                return [new relationTangentCircle_1.default(figures.circle[0], figures.circle[1])];
            }
        },
        {
            name: "tangent line",
            filter: new filterString_1.default(":1circle&1line"),
            create: function (figures) {
                return [new relationTangentLine_1.default(figures.line[0], figures.circle[0])];
            }
        },
    ];
    return RelationCreator;
}());
exports.default = RelationCreator;
//# sourceMappingURL=creator.js.map