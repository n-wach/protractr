"use strict";
/**
 * @module gcs/io
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var point_1 = require("../../gcs/geometry/point");
var line_1 = require("../../gcs/geometry/line");
var arc_1 = require("../../gcs/geometry/arc");
var circle_1 = require("../../gcs/geometry/circle");
var LatexExporter = /** @class */ (function () {
    function LatexExporter() {
    }
    LatexExporter.prototype.getFilename = function () {
        return "sketch.tex";
    };
    LatexExporter.prototype.sketchToString = function (sketch) {
        var latex = "";
        var pointCount = 1;
        var opoints = [];
        var spoints = [];
        for (var _i = 0, _a = sketch.figures; _i < _a.length; _i++) {
            var figure = _a[_i];
            if (figure instanceof point_1.default) {
                opoints.push(figure);
            }
            else if (figure instanceof line_1.default) {
                opoints.push(figure.p0, figure.p1);
            }
            else if (figure instanceof arc_1.default) {
                opoints.push(figure.c, figure.p0, figure.p1);
            }
            else if (figure instanceof circle_1.default) {
                var c = figure.c;
                opoints.push(c);
                var r = figure.r;
                var top_1 = new point_1.default(c.x, c.y + r);
                var bot = new point_1.default(c.x, c.y - r);
                var left = new point_1.default(c.x + r, c.y);
                var right = new point_1.default(c.x - r, c.y);
                spoints.push(top_1, bot, left, right);
            }
        }
        if (opoints.length == 0)
            return "Nothing in sketch.";
        this.minX = opoints[0].x;
        this.minY = opoints[0].y;
        this.maxX = opoints[0].x;
        this.maxY = opoints[0].y;
        for (var _b = 0, opoints_1 = opoints; _b < opoints_1.length; _b++) {
            var point = opoints_1[_b];
            this.minX = Math.min(this.minX, point.x);
            this.minY = Math.min(this.minY, point.y);
            this.maxX = Math.max(this.maxX, point.x);
            this.maxY = Math.max(this.maxY, point.y);
        }
        // we determine size separately from offsets (includes extremes of circles)
        var tminX = this.minX;
        var tminY = this.minY;
        var tmaxX = this.maxX;
        var tmaxY = this.maxY;
        for (var _c = 0, spoints_1 = spoints; _c < spoints_1.length; _c++) {
            var point = spoints_1[_c];
            tminX = Math.min(tminX, point.x);
            tminY = Math.min(tminY, point.y);
            tmaxX = Math.max(tmaxX, point.x);
            tmaxY = Math.max(tmaxY, point.y);
        }
        var width = tmaxX - tminX;
        var height = tmaxY - tminY;
        this.scale = Math.min(450 / width, 800 / height, 1);
        for (var _d = 0, _e = sketch.figures; _d < _e.length; _d++) {
            var figure = _e[_d];
            if (figure instanceof point_1.default) {
                latex += this.lp(figure, pointCount++);
            }
            else if (figure instanceof line_1.default) {
                latex += this.lp(figure.p0, pointCount++);
                latex += this.lp(figure.p1, pointCount++);
                latex += "\t\\draw (P" + (pointCount - 2) + ") -- (P" + (pointCount - 1) + ");\n";
            }
            else if (figure instanceof arc_1.default) {
            }
            else if (figure instanceof circle_1.default) {
                latex += this.lp(figure.c, pointCount++);
                latex += "\t\\draw (P" + (pointCount - 1) + ") circle (" + figure.r * this.scale + ");\n";
            }
            latex += "\n";
        }
        return "\\begin{tikzpicture}[scale=0.035, black, line width=1pt, point/.style={circle, fill, inner sep=1.5pt}]\n"
            + latex
            + "\\end{tikzpicture}\n";
    };
    LatexExporter.prototype.lp = function (point, num) {
        var x = Math.round((point.x - this.minX) * this.scale);
        var y = Math.round((this.maxY - point.y) * this.scale);
        var latex = "\t\\node[point] at (" + x + ", " + y + ") (P" + num + ") {};\n";
        if (point.label && point.labelPosition) {
            if (point.labelPosition == "center") {
                latex = "\t\\node at (" + x + ", " + y + ") (P" + num + ") {" + point.label + "};\n";
            }
            else {
                latex += "\t\\node[" + point.labelPosition + "] at (P" + num + ") {" + point.label + "};\n";
            }
        }
        return latex;
    };
    return LatexExporter;
}());
exports.LatexExporter = LatexExporter;
//# sourceMappingURL=latex.js.map