"use strict";
/**
 * @module ui/tools
 * @preferred
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var Tool = /** @class */ (function () {
    function Tool(protractr) {
        this.protractr = protractr;
        this.reset();
    }
    Tool.prototype.getFigureNearPoint = function (point) {
        return this.protractr.sketch.getClosestFigure(point, this.protractr.ui.sketchView.ctxScale, 10);
    };
    return Tool;
}());
exports.default = Tool;
//# sourceMappingURL=tool.js.map