"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module ui/container
 */
/** */
var Container = /** @class */ (function () {
    function Container(elements, updateCallback) {
        this.elements = elements;
        this.updateCallback = updateCallback;
    }
    Container.prototype.update = function () {
        if (this.updateCallback)
            this.updateCallback();
    };
    Container.prototype.add = function () {
        var _a;
        var elements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            elements[_i] = arguments[_i];
        }
        (_a = this.elements).push.apply(_a, elements);
        this.update();
    };
    Container.prototype.remove = function () {
        var elements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            elements[_i] = arguments[_i];
        }
        for (var _a = 0, elements_1 = elements; _a < elements_1.length; _a++) {
            var e = elements_1[_a];
            var i = this.elements.indexOf(e);
            if (i === -1)
                continue;
            this.elements.splice(i, 1);
        }
        this.update();
    };
    Container.prototype.contains = function (element) {
        return this.elements.indexOf(element) !== -1;
    };
    Container.prototype.togglePresence = function (element) {
        if (this.contains(element)) {
            this.remove(element);
        }
        else {
            this.add(element);
        }
    };
    Container.prototype.set = function () {
        var elements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            elements[_i] = arguments[_i];
        }
        this.elements = elements;
        this.update();
    };
    Container.prototype.clear = function () {
        this.elements = [];
        this.update();
    };
    return Container;
}());
exports.default = Container;
//# sourceMappingURL=container.js.map