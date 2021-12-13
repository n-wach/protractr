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
var ActionExport = /** @class */ (function (_super) {
    __extends(ActionExport, _super);
    function ActionExport() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionExport.prototype.use = function () {
        util_1.saveAs(io_1.default.DEFAULT_EXPORT.sketchToString(this.protractr.sketch), io_1.default.DEFAULT_EXPORT.getFilename());
    };
    return ActionExport;
}(action_1.default));
exports.default = ActionExport;
//# sourceMappingURL=actionExport.js.map