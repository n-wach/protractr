"use strict";
/**
 * @module gcs/relations
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
var relation_1 = require("./relation");
var util_1 = require("../geometry/util");
var RelationEqualLength = /** @class */ (function (_super) {
    __extends(RelationEqualLength, _super);
    function RelationEqualLength() {
        var lines = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lines[_i] = arguments[_i];
        }
        var _this = _super.call(this, "equal length") || this;
        _this.variables = [];
        for (var _a = 0, lines_1 = lines; _a < lines_1.length; _a++) {
            var line = lines_1[_a];
            _this.variables.push(line.p0._x);
            _this.variables.push(line.p0._y);
            _this.variables.push(line.p1._x);
            _this.variables.push(line.p1._y);
        }
        _this.lines = lines;
        return _this;
    }
    RelationEqualLength.prototype.getDeltas = function () {
        var deltas = [];
        var goalLength = this.getGoalLength();
        for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            var p0Goal = util_1.default.pointInDirection(line.p1, line.p0, goalLength);
            var p1Goal = util_1.default.pointInDirection(line.p0, line.p1, goalLength);
            deltas.push.apply(deltas, util_1.default.pointDeltas(line.p0, p0Goal));
            deltas.push.apply(deltas, util_1.default.pointDeltas(line.p1, p1Goal));
        }
        return deltas;
    };
    RelationEqualLength.prototype.getGoalLength = function () {
        var sumDist = 0;
        for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            var len = util_1.default.lengthOfLine(line);
            if (line.p0._x.constant &&
                line.p0._y.constant &&
                line.p1._x.constant &&
                line.p1._y.constant) {
                return len;
            }
            sumDist += len;
        }
        return sumDist / this.lines.length;
    };
    RelationEqualLength.prototype.getError = function () {
        var error = 0;
        var goal = this.getGoalLength();
        for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            var len = util_1.default.lengthOfLine(line);
            error += Math.abs(goal - len);
        }
        return error;
    };
    RelationEqualLength.prototype.getVariables = function () {
        return this.variables;
    };
    return RelationEqualLength;
}(relation_1.default));
exports.default = RelationEqualLength;
//# sourceMappingURL=relationEqualLength.js.map