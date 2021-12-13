"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Figure = /** @class */ (function () {
    function Figure() {
    }
    Object.defineProperty(Figure.prototype, "constant", {
        get: function () {
            return this._constant;
        },
        set: function (b) {
            this.setConstant(b);
            this._constant = b;
        },
        enumerable: true,
        configurable: true
    });
    return Figure;
}());
exports.default = Figure;
//# sourceMappingURL=figure.js.map