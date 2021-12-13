"use strict";
/**
 * @module ui/widgets
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
var widget_1 = require("./widget");
var selectedFigureWidget_1 = require("./selectedFigureWidget");
var newRelationsWidget_1 = require("./newRelationsWidget");
var relationListWidget_1 = require("./relationListWidget");
var selectedFigureListWidget_1 = require("./selectedFigureListWidget");
var SidePanel = /** @class */ (function (_super) {
    __extends(SidePanel, _super);
    function SidePanel(ui, sidePane) {
        var _this = _super.call(this, ui, sidePane) || this;
        _this.addWidget(new selectedFigureListWidget_1.default(ui));
        _this.addWidget(new selectedFigureWidget_1.default(ui));
        _this.addWidget(new newRelationsWidget_1.default(ui));
        _this.addWidget(new relationListWidget_1.default(ui));
        return _this;
    }
    return SidePanel;
}(widget_1.default));
exports.default = SidePanel;
//# sourceMappingURL=sidePanel.js.map