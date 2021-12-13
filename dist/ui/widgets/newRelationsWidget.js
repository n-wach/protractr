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
var creator_1 = require("../../gcs/relations/creator");
var titledWidget_1 = require("./titledWidget");
var NewRelationsWidget = /** @class */ (function (_super) {
    __extends(NewRelationsWidget, _super);
    function NewRelationsWidget(ui) {
        var _this_1 = _super.call(this, ui) || this;
        _this_1.constraintsDiv = document.createElement("div");
        _this_1.div.appendChild(_this_1.constraintsDiv);
        return _this_1;
    }
    NewRelationsWidget.prototype.update = function () {
        _super.prototype.update.call(this);
        while (this.constraintsDiv.lastChild) {
            this.constraintsDiv.removeChild(this.constraintsDiv.lastChild);
        }
        var figures = this.ui.selectedFigures.elements;
        if (figures.length == 0) {
            this.setVisible(false);
            return;
        }
        this.setVisible(true);
        var environments = creator_1.default.getSatisfiedEnvironments(figures);
        if (environments.length == 0) {
            this.setTitle("No possible relations");
            return;
        }
        this.setTitle("Add a relation:");
        var _loop_1 = function (environment) {
            var b = document.createElement("button");
            b.innerText = environment.name;
            var _this = this_1;
            b.onclick = function () {
                var _a;
                var relations = creator_1.default.createRelations(figures, environment);
                (_a = _this.ui.protractr.sketch.relationManager).addRelations.apply(_a, relations);
                _this.ui.pushState();
                _this.ui.update();
            };
            this_1.constraintsDiv.appendChild(b);
        };
        var this_1 = this;
        for (var _i = 0, environments_1 = environments; _i < environments_1.length; _i++) {
            var environment = environments_1[_i];
            _loop_1(environment);
        }
    };
    return NewRelationsWidget;
}(titledWidget_1.default));
exports.default = NewRelationsWidget;
//# sourceMappingURL=newRelationsWidget.js.map