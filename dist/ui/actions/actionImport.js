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
var io_1 = require("../io/io");
var ActionImport = /** @class */ (function (_super) {
    __extends(ActionImport, _super);
    function ActionImport() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionImport.prototype.use = function () {
        var input = prompt("JSON or URL to import");
        if (input[0] == "{") {
            this.protractr.setSketch(io_1.default.DEFAULT_IMPORT.stringToSketch(input));
        }
        else {
            this.protractr.loadFromURL(input);
        }
    };
    return ActionImport;
}(action_1.default));
exports.default = ActionImport;
//# sourceMappingURL=actionImport.js.map