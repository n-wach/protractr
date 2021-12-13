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
var point_1 = require("../../gcs/geometry/point");
var line_1 = require("../../gcs/geometry/line");
var circle_1 = require("../../gcs/geometry/circle");
var SelectedFigureWidget = /** @class */ (function (_super) {
    __extends(SelectedFigureWidget, _super);
    function SelectedFigureWidget(ui) {
        var _this_1 = _super.call(this, ui) || this;
        _this_1.fields = [];
        _this_1.variables = [];
        return _this_1;
    }
    SelectedFigureWidget.prototype.update = function () {
        var figures = this.ui.selectedFigures.elements;
        if (figures.length == 1) {
            if (this.currentFigure == figures[0]) {
                this.refreshValues();
            }
            else {
                this.initializeVariables(figures[0]);
                this.currentFigure = figures[0];
            }
            this.setVisible(true);
        }
        else {
            this.setVisible(false);
            this.currentFigure = null;
        }
    };
    SelectedFigureWidget.prototype.refreshValues = function () {
        for (var i = 0; i < this.variables.length; i++) {
            this.fields[i].value = "" + this.variables[i].v;
        }
    };
    SelectedFigureWidget.prototype.initializeVariables = function (figure) {
        this.fields = [];
        this.variables = [];
        while (this.div.lastChild) {
            this.div.removeChild(this.div.lastChild);
        }
        if (figure instanceof point_1.default) {
            this.addVariable(figure._x, "x");
            this.addVariable(figure._y, "y");
            this.addLabelFields(figure);
        }
        else if (figure instanceof line_1.default) {
            this.addVariable(figure.p0._x, "x1");
            this.addVariable(figure.p0._y, "y1");
            this.addVariable(figure.p1._x, "x2");
            this.addVariable(figure.p1._y, "y2");
        }
        else if (figure instanceof circle_1.default) {
            this.addVariable(figure.c._x, "center x");
            this.addVariable(figure.c._y, "center y");
            this.addVariable(figure._r, "radius");
        }
    };
    SelectedFigureWidget.prototype.addLabelFields = function (point) {
        var div = document.createElement("div");
        var label = document.createElement("span");
        label.innerText = "Label:";
        div.appendChild(label);
        var field = document.createElement("input");
        field.type = "text";
        field.value = point.label ? point.label : "";
        var _this = this;
        field.onchange = function () {
            point.label = field.value;
            _this.ui.update();
            _this.ui.pushState();
        };
        div.appendChild(field);
        this.div.appendChild(div);
        var pdiv = document.createElement("div");
        var labelPosition = document.createElement("span");
        labelPosition.innerText = "LabelPosition:";
        pdiv.appendChild(labelPosition);
        var pfield = document.createElement("select");
        for (var _i = 0, _a = ["center", "below", "above", "left", "right"]; _i < _a.length; _i++) {
            var t = _a[_i];
            var po = document.createElement("option");
            po.value = t;
            po.innerText = t;
            pfield.appendChild(po);
        }
        pfield.value = point.labelPosition ? point.labelPosition : "";
        pfield.onchange = function () {
            point.labelPosition = pfield.value;
            _this.ui.pushState();
            _this.ui.update();
        };
        pdiv.appendChild(pfield);
        this.div.appendChild(pdiv);
    };
    SelectedFigureWidget.prototype.addVariable = function (variable, name) {
        var div = document.createElement("div");
        var label = document.createElement("span");
        label.innerText = name + ":";
        div.appendChild(label);
        var field = document.createElement("input");
        field.type = "number";
        field.step = "any";
        field.value = "" + variable.v;
        var _this = this;
        field.onchange = function () {
            variable.v = parseFloat(field.value);
            variable.constant = true;
            _this.ui.protractr.sketch.solveWithConstantFigures([], true);
            variable.constant = false;
            _this.ui.pushState();
            _this.ui.update();
        };
        div.appendChild(field);
        this.div.appendChild(div);
        this.fields.push(field);
        this.variables.push(variable);
    };
    return SelectedFigureWidget;
}(widget_1.default));
exports.default = SelectedFigureWidget;
//# sourceMappingURL=selectedFigureWidget.js.map