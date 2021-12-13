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
var ActionUndo = /** @class */ (function (_super) {
    __extends(ActionUndo, _super);
    function ActionUndo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionUndo.prototype.use = function () {
        this.protractr.ui.restoreState(this.protractr.ui.history.undo());
    };
    return ActionUndo;
}(action_1.default));
exports.default = ActionUndo;
//# sourceMappingURL=actionUndo.js.map