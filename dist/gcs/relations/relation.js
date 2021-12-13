"use strict";
/**
 * @module gcs/relations
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var point_1 = require("../geometry/point");
var line_1 = require("../geometry/line");
var circle_1 = require("../geometry/circle");
var Relation = /** @class */ (function () {
    function Relation(name) {
        this.name = "abstract relation";
        this.name = name;
    }
    Relation.prototype.containsVariable = function (variable) {
        return this.getVariables().indexOf(variable) !== -1;
    };
    Relation.prototype.containsFigure = function (figure) {
        if (figure instanceof point_1.default) {
            return this.containsVariable(figure._x) || this.containsVariable(figure._y);
        }
        else if (figure instanceof line_1.default) {
            return this.containsFigure(figure.p0) && this.containsFigure(figure.p1);
        }
        else if (figure instanceof circle_1.default) {
            return this.containsVariable(figure._r);
        }
        return false;
    };
    Relation.prototype.remove = function () {
        // usually do nothing...
    };
    return Relation;
}());
exports.default = Relation;
//# sourceMappingURL=relation.js.map