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
var listWidget_1 = require("./listWidget");
var filterString_1 = require("../../gcs/filterString");
var SelectedFigureListWidget = /** @class */ (function (_super) {
    __extends(SelectedFigureListWidget, _super);
    function SelectedFigureListWidget() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectedFigureListWidget.prototype.update = function () {
        var figures = this.ui.selectedFigures.elements;
        if (figures.length == 0) {
            this.setVisible(false);
        }
        else if (figures.length == 1) {
            this.setVisible(true);
            this.setTitle("Selected Figure:");
        }
        else {
            this.setVisible(true);
            this.setTitle("Selected Figures:");
        }
        this.setItems(figures);
    };
    SelectedFigureListWidget.prototype.getElementFromItem = function (item) {
        return new SelectedFigureElement(this.ui, item, filterString_1.getFigureTypeString(item), "delete.png", "Remove from selection");
    };
    return SelectedFigureListWidget;
}(listWidget_1.default));
exports.default = SelectedFigureListWidget;
var SelectedFigureElement = /** @class */ (function (_super) {
    __extends(SelectedFigureElement, _super);
    function SelectedFigureElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectedFigureElement.prototype.actionIconClicked = function (event) {
        this.ui.selectedFigures.remove(this.value);
        this.ui.boldFigures.remove(this.value);
        this.ui.update();
        event.stopPropagation();
        return false;
    };
    SelectedFigureElement.prototype.onmousedown = function (event) {
        this.ui.selectedFigures.set(this.value);
        this.ui.update();
    };
    SelectedFigureElement.prototype.onmouseenter = function (event) {
        this.ui.boldFigures.add(this.value);
        this.ui.update();
    };
    SelectedFigureElement.prototype.onmouseleave = function (event) {
        this.ui.boldFigures.remove(this.value);
        this.ui.update();
    };
    return SelectedFigureElement;
}(listWidget_1.ListElement));
//# sourceMappingURL=selectedFigureListWidget.js.map