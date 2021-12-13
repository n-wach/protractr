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
var circle_1 = require("../../gcs/geometry/circle");
var util_1 = require("../../gcs/geometry/util");
var ToolCreateCircle = /** @class */ (function (_super) {
    __extends(ToolCreateCircle, _super);
    function ToolCreateCircle(protractr) {
        return _super.call(this, protractr, 2) || this;
    }
    ToolCreateCircle.prototype.addFigure = function () {
        var center = this.points[0].point;
        var radius = util_1.default.distanceBetweenPoints(center, this.points[1].point);
        var circle = new circle_1.default(center, radius);
        this.addRelationsBySnap(circle.c, this.points[0].snapFigure);
        this.addRelationsBySnap(circle, this.points[1].snapFigure);
        this.protractr.sketch.addFigure(circle);
    };
    ToolCreateCircle.prototype.draw = function (sketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
        else {
            var center = this.points[0].point;
            sketchView.drawPoint(center);
            var radius = util_1.default.distanceBetweenPoints(center, this.currentPoint.point);
            sketchView.drawCircle(center, radius);
        }
    };
    return ToolCreateCircle;
}(toolCreateFigure_1.default));
exports.default = ToolCreateCircle;
//# sourceMappingURL=toolCreateCircle.js.map