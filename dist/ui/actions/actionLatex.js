"use strict";
/**
 * @module ui/actions
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
var action_1 = require("./action");
var util_1 = require("../util");
var io_1 = require("../io/io");
var ActionLatex = /** @class */ (function (_super) {
    __extends(ActionLatex, _super);
    function ActionLatex() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionLatex.prototype.use = function () {
        var latex = io_1.default.LATEX_EXPORT.sketchToString(this.protractr.sketch);
        navigator.clipboard.writeText(latex)
            .then(function () {
            alert("LaTeX copied to clipboard");
        })
            .catch(function () {
            util_1.saveAs(latex, io_1.default.LATEX_EXPORT.getFilename());
        });
    };
    return ActionLatex;
}(action_1.default));
exports.default = ActionLatex;
//# sourceMappingURL=actionLatex.js.map