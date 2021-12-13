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
var point_1 = require("../../gcs/geometry/point");
var line_1 = require("../../gcs/geometry/line");
var relationEqual_1 = require("../../gcs/relations/relationEqual");
var ToolCreateRect = /** @class */ (function (_super) {
    __extends(ToolCreateRect, _super);
    function ToolCreateRect(protractr) {
        return _super.call(this, protractr, 2) || this;
    }
    ToolCreateRect.prototype.addFigure = function () {
        var p0 = this.points[0].point;
        var p2 = this.points[1].point;
        var p1 = new point_1.default(p2.x, p0.y);
        var p3 = new point_1.default(p0.x, p2.y);
        var h0 = new line_1.default(p0, p1);
        var v0 = new line_1.default(p1, p2);
        var h1 = new line_1.default(p2, p3);
        var v1 = new line_1.default(p3, p0);
        var hc0 = new relationEqual_1.default("horizontal", h0.p0._y, h0.p1._y, v0.p0._y, v1.p1._y);
        var hc1 = new relationEqual_1.default("horizontal", h1.p0._y, h1.p1._y, v0.p1._y, v1.p0._y);
        var vc0 = new relationEqual_1.default("vertical", v0.p0._x, v0.p1._x, h0.p1._x, h1.p0._x);
        var vc1 = new relationEqual_1.default("vertical", v1.p0._x, v1.p1._x, h0.p0._x, h1.p1._x);
        this.protractr.sketch.relationManager.addRelations(hc0, hc1, vc0, vc1);
        this.addRelationsBySnap(h0.p0, this.points[0].snapFigure);
        this.addRelationsBySnap(v1.p1, this.points[0].snapFigure);
        this.addRelationsBySnap(h1.p0, this.points[1].snapFigure);
        this.addRelationsBySnap(v0.p1, this.points[1].snapFigure);
        this.protractr.sketch.addFigures(h0, h1, v0, v1);
    };
    ToolCreateRect.prototype.draw = function (sketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
        else {
            var p0 = this.points[0].point;
            var p2 = this.points[1].point;
            var p1 = new point_1.default(p2.x, p0.y);
            var p3 = new point_1.default(p0.x, p2.y);
            sketchView.drawPoint(p0);
            sketchView.drawPoint(p1);
            sketchView.drawPoint(p2);
            sketchView.drawPoint(p3);
            sketchView.drawLine(p0, p1);
            sketchView.drawLine(p1, p2);
            sketchView.drawLine(p2, p3);
            sketchView.drawLine(p3, p0);
        }
    };
    return ToolCreateRect;
}(toolCreateFigure_1.default));
exports.default = ToolCreateRect;
//# sourceMappingURL=toolCreateRect.js.map