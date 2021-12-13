"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Widget = /** @class */ (function () {
    function Widget(ui, div) {
        this.ui = ui;
        if (div) {
            this.div = div;
        }
        else {
            this.div = document.createElement("div");
        }
        this.children = [];
    }
    Widget.prototype.setVisible = function (visible) {
        this.div.style.display = visible ? "block" : "none";
    };
    Widget.prototype.addWidget = function (widget) {
        this.div.appendChild(widget.div);
        this.children.push(widget);
    };
    Widget.prototype.update = function () {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.update();
        }
    };
    return Widget;
}());
exports.default = Widget;
//# sourceMappingURL=widget.js.map