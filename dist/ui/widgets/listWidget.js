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
var titledWidget_1 = require("./titledWidget");
var widget_1 = require("./widget");
var ListWidget = /** @class */ (function (_super) {
    __extends(ListWidget, _super);
    function ListWidget(ui) {
        var _this = _super.call(this, ui) || this;
        _this.values = [];
        _this.elements = [];
        _this.list = document.createElement("div");
        _this.list.classList.add("interactive-list");
        _this.div.appendChild(_this.list);
        return _this;
    }
    ListWidget.prototype.setItems = function (items) {
        if (items.length == 0) {
            this.clear();
            return;
        }
        for (var _i = 0, _a = this.values; _i < _a.length; _i++) {
            var value = _a[_i];
            // if any existing value isn't in the new values, remove it
            if (items.indexOf(value) === -1) {
                this.removeItem(value);
            }
        }
        for (var _b = 0, items_1 = items; _b < items_1.length; _b++) {
            var item = items_1[_b];
            // if any new value isn't in existing values, add it
            if (this.values.indexOf(item) === -1) {
                this.addItem(item);
            }
        }
    };
    ListWidget.prototype.clear = function () {
        while (this.list.lastChild) {
            this.list.removeChild(this.list.lastChild);
        }
        this.list.style.display = "none";
        this.elements = [];
        this.values = [];
    };
    ListWidget.prototype.addItem = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        for (var _a = 0, items_2 = items; _a < items_2.length; _a++) {
            var item = items_2[_a];
            var element = this.getElementFromItem(item);
            this.list.appendChild(element.div);
            this.values.push(item);
            this.elements.push(element);
        }
        if (items.length > 0)
            this.list.style.display = "block";
    };
    ListWidget.prototype.removeItem = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        for (var _a = 0, items_3 = items; _a < items_3.length; _a++) {
            var item = items_3[_a];
            var i = this.values.indexOf(item);
            if (i == -1)
                continue;
            this.list.removeChild(this.elements[i].div);
            this.elements.splice(i, 1);
            this.values.splice(i, 1);
        }
    };
    return ListWidget;
}(titledWidget_1.default));
exports.default = ListWidget;
var ListElement = /** @class */ (function (_super) {
    __extends(ListElement, _super);
    function ListElement(ui, value, name, actionIcon, actionTitle) {
        var _this = _super.call(this, ui) || this;
        _this.value = value;
        _this.div.classList.add("interactive-list-element");
        _this.div.addEventListener("mouseenter", _this.onmouseenter.bind(_this));
        _this.div.addEventListener("mouseleave", _this.onmouseleave.bind(_this));
        _this.div.addEventListener("mousedown", _this.onmousedown.bind(_this));
        _this.spanName = document.createElement("span");
        _this.spanName.innerText = name;
        _this.spanName.classList.add("element-name");
        _this.div.appendChild(_this.spanName);
        if (actionIcon) {
            _this.actionButton = document.createElement("span");
            _this.actionButton.classList.add("action-button");
            _this.actionButton.style.backgroundImage = "url('image/" + actionIcon + "')";
            _this.actionButton.addEventListener("mousedown", _this.actionIconClicked.bind(_this));
            if (actionTitle)
                _this.actionButton.title = actionTitle;
            _this.div.appendChild(_this.actionButton);
        }
        return _this;
    }
    return ListElement;
}(widget_1.default));
exports.ListElement = ListElement;
//# sourceMappingURL=listWidget.js.map