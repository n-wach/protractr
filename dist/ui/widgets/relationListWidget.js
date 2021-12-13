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
var listWidget_1 = require("./listWidget");
var RelationListWidget = /** @class */ (function (_super) {
    __extends(RelationListWidget, _super);
    function RelationListWidget() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RelationListWidget.prototype.update = function () {
        var figures = this.ui.selectedFigures.elements;
        if (figures.length == 0) {
            var relations = this.ui.protractr.sketch.relationManager.relations;
            if (relations.length == 0) {
                this.setTitle("No relations in sketch");
            }
            else {
                this.setTitle("Sketch relations: ");
            }
            this.setItems(relations);
        }
        else {
            var relations = [];
            for (var _i = 0, _a = this.ui.protractr.sketch.relationManager.relations; _i < _a.length; _i++) {
                var relation = _a[_i];
                var add = true;
                for (var _b = 0, figures_1 = figures; _b < figures_1.length; _b++) {
                    var figure = figures_1[_b];
                    // only display relations that contain all selected figures...
                    // that means remove any relation that doesn't contain any 1 selected figure
                    if (!relation.containsFigure(figure)) {
                        add = false;
                        break;
                    }
                }
                if (add) {
                    relations.push(relation);
                }
            }
            if (relations.length == 0) {
                if (figures.length == 1) {
                    this.setTitle("No relations on selected figure");
                }
                else {
                    this.setTitle("No relations exist between the selected figures");
                }
            }
            else {
                if (figures.length == 1) {
                    this.setTitle("Figure relations:");
                }
                else {
                    this.setTitle("Selection relations:");
                }
            }
            this.setItems(relations);
        }
    };
    RelationListWidget.prototype.getElementFromItem = function (item) {
        return new RelationElement(this.ui, item, item.name, "delete.png", "Delete relation");
    };
    return RelationListWidget;
}(listWidget_1.default));
exports.default = RelationListWidget;
var RelationElement = /** @class */ (function (_super) {
    __extends(RelationElement, _super);
    function RelationElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RelationElement.prototype.actionIconClicked = function (event) {
        this.ui.protractr.sketch.relationManager.removeRelations(this.value);
        this.ui.selectedRelations.remove(this.value);
        this.ui.update();
        event.stopPropagation();
        return false;
    };
    RelationElement.prototype.onmousedown = function (event) {
    };
    RelationElement.prototype.onmouseenter = function (event) {
        this.ui.selectedRelations.add(this.value);
        this.ui.update();
    };
    RelationElement.prototype.onmouseleave = function (event) {
        this.ui.selectedRelations.remove(this.value);
        this.ui.update();
    };
    return RelationElement;
}(listWidget_1.ListElement));
//# sourceMappingURL=relationListWidget.js.map