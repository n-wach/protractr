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
var line_1 = require("../../gcs/geometry/line");
var ToolCreateLine = /** @class */ (function (_super) {
    __extends(ToolCreateLine, _super);
    function ToolCreateLine(protractr) {
        return _super.call(this, protractr, 2) || this;
    }
    ToolCreateLine.prototype.addFigure = function () {
        var line = new line_1.default(this.points[0].point, this.points[1].point);
        this.addRelationsBySnap(line.p0, this.points[0].snapFigure);
        this.addRelationsBySnap(line.p1, this.points[1].snapFigure);
        this.protractr.sketch.addFigure(line);
    };
    ToolCreateLine.prototype.draw = function (sketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
        else {
            var p0 = this.points[0].point;
            var p1 = this.points[1].point;
            sketchView.drawPoint(p0);
            sketchView.drawPoint(p1);
            sketchView.drawLine(p0, p1);
        }
    };
    return ToolCreateLine;
}(toolCreateFigure_1.default));
exports.default = ToolCreateLine;
//# sourceMappingURL=toolCreateLine.js.map