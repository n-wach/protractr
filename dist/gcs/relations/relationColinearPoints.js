"use strict";
/**
 * @module gcs/relations
 */
/** */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var relation_1 = require("./relation");
var line_1 = require("../geometry/line");
var util_1 = require("../geometry/util");
var RelationColinearPoints = /** @class */ (function (_super) {
    __extends(RelationColinearPoints, _super);
    function RelationColinearPoints() {
        var points = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            points[_i] = arguments[_i];
        }
        var _this = _super.call(this, "colinear points") || this;
        _this.variables = [];
        for (var _a = 0, points_1 = points; _a < points_1.length; _a++) {
            var point = points_1[_a];
            _this.variables.push(point._x);
            _this.variables.push(point._y);
        }
        _this.points = points;
        return _this;
    }
    RelationColinearPoints.prototype.getDeltas = function () {
        var deltas = [];
        var regression = util_1.default.forcedRegressionLine.apply(util_1.default, this.points);
        if (!regression)
            regression = util_1.default.leastSquaresRegression.apply(util_1.default, this.points);
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            var projection = util_1.default.projectOntoLine(regression, point);
            deltas.push.apply(deltas, util_1.default.pointDeltas(point, projection));
        }
        return deltas;
    };
    RelationColinearPoints.prototype.getError = function () {
        var regression = util_1.default.forcedRegressionLine.apply(util_1.default, this.points);
        if (!regression)
            regression = util_1.default.leastSquaresRegression.apply(util_1.default, this.points);
        var error = 0;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            error += util_1.default.distanceToLine(regression, point);
        }
        return error;
    };
    RelationColinearPoints.prototype.getVariables = function () {
        return this.variables;
    };
    RelationColinearPoints.prototype.containsFigure = function (figure) {
        if (figure instanceof line_1.default)
            return false;
        return _super.prototype.containsFigure.call(this, figure);
    };
    return RelationColinearPoints;
}(relation_1.default));
exports.default = RelationColinearPoints;
//# sourceMappingURL=relationColinearPoints.js.map