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
var toolSelect_1 = require("./toolSelect");
var filterString_1 = require("../../gcs/filterString");
var ToolFilterSelect = /** @class */ (function (_super) {
    __extends(ToolFilterSelect, _super);
    function ToolFilterSelect(protractr, filterString) {
        var _this = _super.call(this, protractr) || this;
        _this.filter = new filterString_1.default(filterString);
        return _this;
    }
    ToolFilterSelect.prototype.figureShouldBeSelected = function (figure) {
        return this.filter.satisfiesFilter([figure]) && _super.prototype.figureShouldBeSelected.call(this, figure);
    };
    return ToolFilterSelect;
}(toolSelect_1.default));
exports.default = ToolFilterSelect;
//# sourceMappingURL=toolFilterSelect.js.map