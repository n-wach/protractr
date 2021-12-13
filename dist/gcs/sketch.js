"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module gcs/sketch
 */
/** */
var point_1 = require("./geometry/point");
var manager_1 = require("./relations/manager");
var util_1 = require("./geometry/util");
var relationPointsOnCircle_1 = require("./relations/relationPointsOnCircle");
var arc_1 = require("./geometry/arc");
var Sketch = /** @class */ (function () {
    function Sketch() {
        this.figures = [];
        this.relationManager = new manager_1.default();
    }
    Sketch.prototype.getClosestFigure = function (point, scale, maxDist) {
        if (scale === void 0) { scale = 1; }
        if (maxDist === void 0) { maxDist = 10; }
        var allFigures = [];
        for (var _i = 0, _a = this.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            allFigures.push(fig);
            allFigures.push.apply(allFigures, fig.getChildFigures());
        }
        var closestDist = 0;
        var closest = null;
        for (var _b = 0, allFigures_1 = allFigures; _b < allFigures_1.length; _b++) {
            var fig = allFigures_1[_b];
            var p = fig.getClosestPoint(point);
            var dist = util_1.default.distanceBetweenPoints(p, point);
            if (fig instanceof point_1.default) {
                dist -= 5 / scale; // make it easier to be closest to a point
            }
            if (dist < closestDist || closest == null) {
                closest = fig;
                closestDist = dist;
            }
        }
        if (closestDist > maxDist / scale)
            return null;
        return closest;
    };
    Sketch.prototype.solveWithConstantFigures = function (figures, tireless) {
        if (tireless === void 0) { tireless = false; }
        for (var _i = 0, figures_1 = figures; _i < figures_1.length; _i++) {
            var fig = figures_1[_i];
            fig.constant = true;
        }
        this.relationManager.solveRelations(tireless);
        for (var _a = 0, figures_2 = figures; _a < figures_2.length; _a++) {
            var fig = figures_2[_a];
            fig.constant = false;
        }
        if (tireless && !this.relationManager.isSolved()) {
            alert("That state couldn't be solved...");
        }
    };
    Sketch.prototype.addFigure = function (figure) {
        if (this.figures.indexOf(figure) != -1)
            return;
        if (figure instanceof arc_1.default) {
            var relation = new relationPointsOnCircle_1.default(figure, figure.p0, figure.p1);
            this.relationManager.addRelations(relation);
        }
        this.figures.push(figure);
    };
    Sketch.prototype.addFigures = function () {
        var figures = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            figures[_i] = arguments[_i];
        }
        for (var _a = 0, figures_3 = figures; _a < figures_3.length; _a++) {
            var figure = figures_3[_a];
            this.addFigure(figure);
        }
    };
    return Sketch;
}());
exports.default = Sketch;
//# sourceMappingURL=sketch.js.map