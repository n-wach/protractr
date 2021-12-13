"use strict";
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
/**
 * @module ui/widgets
 */
/** */
var widget_1 = require("./widget");
var TitledWidget = /** @class */ (function (_super) {
    __extends(TitledWidget, _super);
    function TitledWidget(ui) {
        var _this = _super.call(this, ui) || this;
        _this.title = document.createElement("p");
        _this.div.appendChild(_this.title);
        return _this;
    }
    TitledWidget.prototype.setTitle = function (title) {
        this.title.innerText = title;
    };
    return TitledWidget;
}(widget_1.default));
exports.default = TitledWidget;
//# sourceMappingURL=titledWidget.js.map