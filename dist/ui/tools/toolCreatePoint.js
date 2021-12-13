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
var ToolCreatePoint = /** @class */ (function (_super) {
    __extends(ToolCreatePoint, _super);
    function ToolCreatePoint(protractr) {
        return _super.call(this, protractr, 1) || this;
    }
    ToolCreatePoint.prototype.addFigure = function () {
        var point = this.points[0].point.copy();
        this.addRelationsBySnap(point, this.points[0].snapFigure);
        this.protractr.sketch.addFigure(point);
    };
    ToolCreatePoint.prototype.draw = function (sketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
    };
    return ToolCreatePoint;
}(toolCreateFigure_1.default));
exports.default = ToolCreatePoint;
//# sourceMappingURL=toolCreatePoint.js.map