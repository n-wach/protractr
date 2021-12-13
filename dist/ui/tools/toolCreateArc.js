"use strict";
/**
 * @module ui/tools
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
var toolCreateFigure_1 = require("./toolCreateFigure");
var util_1 = require("../../gcs/geometry/util");
var arc_1 = require("../../gcs/geometry/arc");
var ToolCreateArc = /** @class */ (function (_super) {
    __extends(ToolCreateArc, _super);
    function ToolCreateArc(protractr) {
        return _super.call(this, protractr, 3) || this;
    }
    ToolCreateArc.prototype.addFigure = function () {
        var center = this.points[0].point;
        var radius = util_1.default.distanceBetweenPoints(center, this.points[1].point);
        var a0 = util_1.default.getAngleBetween(center, this.points[1].point);
        var a1 = util_1.default.getAngleBetween(center, this.points[2].point);
        var arc = new arc_1.default(center, radius, a0, a1);
        this.addRelationsBySnap(arc.c, this.points[0].snapFigure);
        this.addRelationsBySnap(arc.p0, this.points[1].snapFigure);
        this.addRelationsBySnap(arc.p1, this.points[2].snapFigure);
        this.protractr.sketch.addFigure(arc);
    };
    ToolCreateArc.prototype.draw = function (sketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
        else if (this.points.length == 2) {
            var center = this.points[0].point;
            sketchView.drawPoint(center);
            var radius = util_1.default.distanceBetweenPoints(center, this.currentPoint.point);
            sketchView.drawCircle(center, radius);
            sketchView.drawPoint(this.currentPoint.point);
        }
        else {
            var center = this.points[0].point;
            var p0 = this.points[1].point;
            var radius = util_1.default.distanceBetweenPoints(center, p0);
            var p1 = util_1.default.pointInDirection(center, this.currentPoint.point, radius);
            sketchView.drawPoint(center);
            sketchView.drawPoint(p0);
            sketchView.drawPoint(p1);
            var a0 = util_1.default.getAngleBetween(center, p0);
            var a1 = util_1.default.getAngleBetween(center, p1);
            sketchView.drawArc(center, radius, a0, a1);
        }
    };
    return ToolCreateArc;
}(toolCreateFigure_1.default));
exports.default = ToolCreateArc;
//# sourceMappingURL=toolCreateArc.js.map