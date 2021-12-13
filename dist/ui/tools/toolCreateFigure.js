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
var tool_1 = require("./tool");
var point_1 = require("../../gcs/geometry/point");
var circle_1 = require("../../gcs/geometry/circle");
var line_1 = require("../../gcs/geometry/line");
var relationEqual_1 = require("../../gcs/relations/relationEqual");
var relationPointsOnCircle_1 = require("../../gcs/relations/relationPointsOnCircle");
var relationColinearPoints_1 = require("../../gcs/relations/relationColinearPoints");
var ToolCreateFigure = /** @class */ (function (_super) {
    __extends(ToolCreateFigure, _super);
    function ToolCreateFigure(protractr, pointsPerFigure) {
        var _this = _super.call(this, protractr) || this;
        _this.pointsPerFigure = pointsPerFigure;
        return _this;
    }
    ToolCreateFigure.prototype.down = function (point) {
        //do nothing
    };
    ToolCreateFigure.prototype.up = function (point) {
        if (this.points.length >= this.pointsPerFigure) {
            this.addFigure();
            this.protractr.ui.update();
            this.protractr.ui.pushState();
            this.points = [];
        }
        this.currentPoint = { point: null, snapFigure: null };
        this.points.push(this.currentPoint);
        this.updateFigureCreationPoint(this.currentPoint, point);
    };
    ToolCreateFigure.prototype.move = function (point) {
        this.updateFigureCreationPoint(this.currentPoint, point);
    };
    ToolCreateFigure.prototype.reset = function () {
        this.currentPoint = { point: null, snapFigure: null };
        this.points = [this.currentPoint];
    };
    ToolCreateFigure.prototype.updateFigureCreationPoint = function (figureCreationPoint, newPoint) {
        figureCreationPoint.snapFigure = this.getFigureNearPoint(newPoint);
        if (figureCreationPoint.snapFigure) {
            figureCreationPoint.point = figureCreationPoint.snapFigure.getClosestPoint(newPoint);
        }
        else {
            figureCreationPoint.point = newPoint.copy();
        }
    };
    ToolCreateFigure.prototype.addRelationsBySnap = function (figure, snapFigure) {
        if (!snapFigure)
            return;
        if (figure instanceof point_1.default) {
            if (snapFigure instanceof point_1.default) {
                var ex = new relationEqual_1.default("vertical", figure._x, snapFigure._x);
                var ey = new relationEqual_1.default("horizontal", figure._y, snapFigure._y);
                this.protractr.sketch.relationManager.addRelations(ex, ey);
            }
            else if (snapFigure instanceof circle_1.default) {
                this.protractr.sketch.relationManager.addRelations(new relationPointsOnCircle_1.default(snapFigure, figure));
            }
            else if (snapFigure instanceof line_1.default) {
                this.protractr.sketch.relationManager.addRelations(new relationColinearPoints_1.default(snapFigure.p0, snapFigure.p1, figure));
                // TODO midpoint
            }
        }
        else if (figure instanceof circle_1.default) {
            if (snapFigure instanceof point_1.default) {
                this.protractr.sketch.relationManager.addRelations(new relationPointsOnCircle_1.default(figure, snapFigure));
            }
        }
    };
    return ToolCreateFigure;
}(tool_1.default));
exports.default = ToolCreateFigure;
//# sourceMappingURL=toolCreateFigure.js.map