(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
var figures_1 = require("./figures");
var Variable = /** @class */ (function () {
    function Variable(v) {
        this.value = v;
        this.constant = false;
    }
    Object.defineProperty(Variable.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (v) {
            if (!this.constant)
                this._value = v;
        },
        enumerable: true,
        configurable: true
    });
    return Variable;
}());
exports.Variable = Variable;
var VariablePoint = /** @class */ (function () {
    function VariablePoint(x, y) {
        this.x = new Variable(x);
        this.y = new Variable(y);
    }
    VariablePoint.prototype.toPoint = function () {
        return new figures_1.Point(this.x.value, this.y.value);
    };
    return VariablePoint;
}());
exports.VariablePoint = VariablePoint;
function sum(vals) {
    var sum = 0;
    for (var _i = 0, vals_1 = vals; _i < vals_1.length; _i++) {
        var v = vals_1[_i];
        sum += v.value;
    }
    return sum;
}
function equalGoal(vals) {
    var sum = 0;
    for (var _i = 0, vals_2 = vals; _i < vals_2.length; _i++) {
        var v = vals_2[_i];
        if (v.constant)
            return v._value;
        sum += v._value;
    }
    return sum / vals.length;
}
var EqualConstraint = /** @class */ (function () {
    function EqualConstraint(vals) {
        this.variables = vals;
    }
    EqualConstraint.prototype.getError = function () {
        var error = 0;
        var avg = equalGoal(this.variables);
        for (var _i = 0, _a = this.variables; _i < _a.length; _i++) {
            var v = _a[_i];
            error += Math.abs(avg - v.value);
        }
        return error;
    };
    EqualConstraint.prototype.getGradient = function (v) {
        if (this.variables.indexOf(v) == -1)
            return 0;
        var avg = equalGoal(this.variables);
        return avg - v.value;
    };
    return EqualConstraint;
}());
exports.EqualConstraint = EqualConstraint;
var CoincidentPointConstraint = /** @class */ (function () {
    function CoincidentPointConstraint(points) {
        var xs = [];
        var ys = [];
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            xs.push(p.x);
            ys.push(p.y);
        }
        this.xEqual = new EqualConstraint(xs);
        this.yEqual = new EqualConstraint(ys);
    }
    CoincidentPointConstraint.prototype.getError = function () {
        return this.xEqual.getError() + this.yEqual.getError();
    };
    CoincidentPointConstraint.prototype.getGradient = function (v) {
        return this.xEqual.getGradient(v) + this.yEqual.getGradient(v);
    };
    return CoincidentPointConstraint;
}());
exports.CoincidentPointConstraint = CoincidentPointConstraint;
var LockConstraint = /** @class */ (function () {
    function LockConstraint(val) {
        this.variable = val;
        this.value = val.value;
    }
    LockConstraint.prototype.getError = function () {
        return Math.abs(this.variable.value - this.value);
    };
    LockConstraint.prototype.getGradient = function (v) {
        if (this.variable != v)
            return 0;
        return this.value - this.variable.value;
    };
    return LockConstraint;
}());
exports.LockConstraint = LockConstraint;
var HorizontalConstraint = /** @class */ (function (_super) {
    __extends(HorizontalConstraint, _super);
    function HorizontalConstraint(points) {
        var _this = this;
        var ys = [];
        for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
            var p = points_2[_i];
            ys.push(p.y);
        }
        _this = _super.call(this, ys) || this;
        return _this;
    }
    return HorizontalConstraint;
}(EqualConstraint));
exports.HorizontalConstraint = HorizontalConstraint;
var VerticalConstraint = /** @class */ (function (_super) {
    __extends(VerticalConstraint, _super);
    function VerticalConstraint(points) {
        var _this = this;
        var xs = [];
        for (var _i = 0, points_3 = points; _i < points_3.length; _i++) {
            var p = points_3[_i];
            xs.push(p.x);
        }
        _this = _super.call(this, xs) || this;
        return _this;
    }
    return VerticalConstraint;
}(EqualConstraint));
exports.VerticalConstraint = VerticalConstraint;
var TangentConstraint = /** @class */ (function () {
    function TangentConstraint(center, radius, points) {
        this.center = center;
        this.radius = radius;
        this.points = points;
    }
    TangentConstraint.prototype.getError = function () {
        var error = 0;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var p = _a[_i];
            var dx = p.x.value - this.center.x.value;
            var dy = p.y.value - this.center.y.value;
            error += Math.abs(this.radius.value - Math.sqrt(dx * dx + dy * dy));
        }
        return error;
    };
    TangentConstraint.prototype.getGradient = function (v) {
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var p = _a[_i];
            if (p.x === v || p.y === v) {
                var center = this.center.toPoint();
                var target = p.toPoint();
                var goal = center.pointTowards(target, this.radius.value);
                if (p.x == v) {
                    return goal.x - v.value;
                }
                else {
                    return goal.y - v.value;
                }
            }
        }
        if (v === this.radius) {
            var totalDist = 0;
            for (var _b = 0, _c = this.points; _b < _c.length; _b++) {
                var p = _c[_b];
                var dx = p.x.value - this.center.x.value;
                var dy = p.y.value - this.center.y.value;
                totalDist += Math.sqrt(dx * dx + dy * dy);
            }
            var averageRadius = totalDist / this.points.length;
            return averageRadius - v.value;
        }
        //TODO add gradients for center of circle.  look for that one stack overflow post again
        return 0;
    };
    return TangentConstraint;
}());
exports.TangentConstraint = TangentConstraint;
var LineMidpointConstraint = /** @class */ (function () {
    function LineMidpointConstraint(p1, p2, midpoint) {
        this.p1 = p1;
        this.p2 = p2;
        this.midpoint = midpoint;
    }
    LineMidpointConstraint.prototype.getError = function () {
        //distance between midpoint and average of two points
        var avgX = (this.p1.x.value + this.p2.x.value) / 2;
        var avgY = (this.p1.y.value + this.p2.y.value) / 2;
        var dx = this.midpoint.x.value - avgX;
        var dy = this.midpoint.y.value - avgY;
        return Math.sqrt(dx * dx + dy * dy);
    };
    LineMidpointConstraint.prototype.getGradient = function (v) {
        if (v === this.midpoint.x) {
            var avgX = (this.p1.x.value + this.p2.x.value) / 2;
            return avgX - v.value;
        }
        else if (v === this.midpoint.y) {
            var avgY = (this.p1.y.value + this.p2.y.value) / 2;
            return avgY - v.value;
        }
        else if (v === this.p1.x || v === this.p1.y) {
            var p2 = this.p2.toPoint();
            var midpoint = this.midpoint.toPoint();
            var halfDist = p2.distTo(midpoint);
            var fullDist = halfDist * 2;
            var goalP1 = p2.pointTowards(midpoint, fullDist);
            if (this.p1.x == v) {
                return goalP1.x - v.value;
            }
            else {
                return goalP1.y - v.value;
            }
        }
        else if (v === this.p2.x || v === this.p2.y) {
            var p1 = this.p1.toPoint();
            var midpoint = this.midpoint.toPoint();
            var halfDist = p1.distTo(midpoint);
            var fullDist = halfDist * 2;
            var goalP2 = p1.pointTowards(midpoint, fullDist);
            if (this.p2.x == v) {
                return goalP2.x - v.value;
            }
            else {
                return goalP2.y - v.value;
            }
        }
        return 0;
    };
    return LineMidpointConstraint;
}());
exports.LineMidpointConstraint = LineMidpointConstraint;

},{"./figures":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constraint_1 = require("./constraint");
var HorizontalPointFilter = /** @class */ (function () {
    function HorizontalPointFilter() {
        this.name = "horizontal";
    }
    HorizontalPointFilter.prototype.validFigures = function (figs) {
        for (var _i = 0, figs_1 = figs; _i < figs_1.length; _i++) {
            var fig = figs_1[_i];
            if (fig.type != "point")
                return false;
        }
        return figs.length > 1;
    };
    HorizontalPointFilter.prototype.createConstraints = function (figs) {
        var points = [];
        for (var _i = 0, _a = figs; _i < _a.length; _i++) {
            var fig = _a[_i];
            points.push(fig.p.variablePoint);
        }
        return [new constraint_1.HorizontalConstraint(points)];
    };
    return HorizontalPointFilter;
}());
var VerticalPointFilter = /** @class */ (function () {
    function VerticalPointFilter() {
        this.name = "vertical";
    }
    VerticalPointFilter.prototype.validFigures = function (figs) {
        for (var _i = 0, figs_2 = figs; _i < figs_2.length; _i++) {
            var fig = figs_2[_i];
            if (fig.type != "point")
                return false;
        }
        return figs.length > 1;
    };
    VerticalPointFilter.prototype.createConstraints = function (figs) {
        var points = [];
        for (var _i = 0, _a = figs; _i < _a.length; _i++) {
            var fig = _a[_i];
            points.push(fig.p.variablePoint);
        }
        return [new constraint_1.VerticalConstraint(points)];
    };
    return VerticalPointFilter;
}());
var VerticalLineFilter = /** @class */ (function () {
    function VerticalLineFilter() {
        this.name = "vertical";
    }
    VerticalLineFilter.prototype.validFigures = function (figs) {
        for (var _i = 0, figs_3 = figs; _i < figs_3.length; _i++) {
            var fig = figs_3[_i];
            if (fig.type != "line")
                return false;
        }
        return figs.length > 0;
    };
    VerticalLineFilter.prototype.createConstraints = function (figs) {
        var constraints = [];
        for (var _i = 0, _a = figs; _i < _a.length; _i++) {
            var line = _a[_i];
            constraints.push(new constraint_1.VerticalConstraint([line.p1.variablePoint, line.p2.variablePoint]));
        }
        return constraints;
    };
    return VerticalLineFilter;
}());
var HorizontalLineFilter = /** @class */ (function () {
    function HorizontalLineFilter() {
        this.name = "horizontal";
    }
    HorizontalLineFilter.prototype.validFigures = function (figs) {
        for (var _i = 0, figs_4 = figs; _i < figs_4.length; _i++) {
            var fig = figs_4[_i];
            if (fig.type != "line")
                return false;
        }
        return figs.length > 0;
    };
    HorizontalLineFilter.prototype.createConstraints = function (figs) {
        var constraints = [];
        for (var _i = 0, _a = figs; _i < _a.length; _i++) {
            var line = _a[_i];
            constraints.push(new constraint_1.HorizontalConstraint([line.p1.variablePoint, line.p2.variablePoint]));
        }
        return constraints;
    };
    return HorizontalLineFilter;
}());
var CoincidentPointFilter = /** @class */ (function () {
    function CoincidentPointFilter() {
        this.name = "coincident";
    }
    CoincidentPointFilter.prototype.validFigures = function (figs) {
        var count = 0;
        for (var _i = 0, figs_5 = figs; _i < figs_5.length; _i++) {
            var fig = figs_5[_i];
            if (fig.type == "point")
                count += 1;
            else
                return false;
        }
        return count > 1;
    };
    CoincidentPointFilter.prototype.createConstraints = function (figs) {
        var points = [];
        for (var _i = 0, _a = figs; _i < _a.length; _i++) {
            var fig = _a[_i];
            points.push(fig.p.variablePoint);
        }
        return [new constraint_1.CoincidentPointConstraint(points)];
    };
    return CoincidentPointFilter;
}());
var ArcPointCoincidentFilter = /** @class */ (function () {
    function ArcPointCoincidentFilter() {
        this.name = "coincident";
    }
    ArcPointCoincidentFilter.prototype.validFigures = function (figs) {
        var hasCircle = false;
        var hasPoints = false;
        for (var _i = 0, figs_6 = figs; _i < figs_6.length; _i++) {
            var fig = figs_6[_i];
            if (fig.type == "point") {
                hasPoints = true;
            }
            else if (fig.type == "circle") {
                if (hasCircle)
                    return false;
                hasCircle = true;
            }
        }
        return hasPoints && hasCircle;
    };
    ArcPointCoincidentFilter.prototype.createConstraints = function (figs) {
        var points = [];
        var circle = null;
        for (var _i = 0, figs_7 = figs; _i < figs_7.length; _i++) {
            var fig = figs_7[_i];
            if (fig.type == "point") {
                points.push(fig.p.variablePoint);
            }
            else if (fig.type == "circle") {
                circle = fig;
            }
        }
        return [new constraint_1.TangentConstraint(circle.c.variablePoint, circle.r, points)];
    };
    return ArcPointCoincidentFilter;
}());
var LineMidpointCoincidentFilter = /** @class */ (function () {
    function LineMidpointCoincidentFilter() {
        this.name = "midpoint";
    }
    LineMidpointCoincidentFilter.prototype.validFigures = function (figs) {
        var hasLine = false;
        var hasPoint = false;
        for (var _i = 0, figs_8 = figs; _i < figs_8.length; _i++) {
            var fig = figs_8[_i];
            if (fig.type == "point") {
                if (hasPoint)
                    return false;
                hasPoint = true;
            }
            else if (fig.type == "line") {
                if (hasLine)
                    return false;
                hasLine = true;
            }
        }
        return hasPoint && hasLine;
    };
    LineMidpointCoincidentFilter.prototype.createConstraints = function (figs) {
        var point = null;
        var line = null;
        for (var _i = 0, figs_9 = figs; _i < figs_9.length; _i++) {
            var fig = figs_9[_i];
            if (fig.type == "point") {
                point = fig;
            }
            else if (fig.type == "line") {
                line = fig;
            }
        }
        return [new constraint_1.LineMidpointConstraint(line.p1.variablePoint, line.p2.variablePoint, point.p.variablePoint)];
    };
    return LineMidpointCoincidentFilter;
}());
var EqualRadiusConstraintFilter = /** @class */ (function () {
    function EqualRadiusConstraintFilter() {
        this.name = "equal";
    }
    EqualRadiusConstraintFilter.prototype.createConstraints = function (figs) {
        var radii = [];
        for (var _i = 0, _a = figs; _i < _a.length; _i++) {
            var fig = _a[_i];
            radii.push(fig.r);
        }
        return [new constraint_1.EqualConstraint(radii)];
    };
    EqualRadiusConstraintFilter.prototype.validFigures = function (figs) {
        for (var _i = 0, figs_10 = figs; _i < figs_10.length; _i++) {
            var fig = figs_10[_i];
            if (fig.type != "circle")
                return false;
        }
        return figs.length > 1;
    };
    return EqualRadiusConstraintFilter;
}());
var possibleConstraints = [
    new CoincidentPointFilter(),
    new HorizontalPointFilter(),
    new HorizontalLineFilter(),
    new VerticalPointFilter(),
    new VerticalLineFilter(),
    new ArcPointCoincidentFilter(),
    new LineMidpointCoincidentFilter(),
    new EqualRadiusConstraintFilter(),
];
function getSatisfiedConstraintFilters(figs) {
    var possibilities = [];
    for (var _i = 0, possibleConstraints_1 = possibleConstraints; _i < possibleConstraints_1.length; _i++) {
        var pc = possibleConstraints_1[_i];
        if (pc.validFigures(figs))
            possibilities.push(pc);
    }
    return possibilities;
}
exports.getSatisfiedConstraintFilters = getSatisfiedConstraintFilters;

},{"./constraint":1}],3:[function(require,module,exports){
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
var constraint_1 = require("./constraint");
var main_1 = require("../main");
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.variablePoint = new constraint_1.VariablePoint(x, y);
    }
    Object.defineProperty(Point.prototype, "x", {
        get: function () {
            return this.variablePoint.x.value;
        },
        set: function (v) {
            this.variablePoint.x.value = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Point.prototype, "y", {
        get: function () {
            return this.variablePoint.y.value;
        },
        set: function (v) {
            this.variablePoint.y.value = v;
        },
        enumerable: true,
        configurable: true
    });
    Point.prototype.set = function (p) {
        this.x = p.x;
        this.y = p.y;
        return this;
    };
    Point.prototype.copy = function () {
        return new Point(this.x, this.y);
    };
    Point.prototype.distTo = function (o) {
        return Math.sqrt(this.distTo2(o));
    };
    Point.prototype.distTo2 = function (o) {
        var dx = o.x - this.x;
        var dy = o.y - this.y;
        return dx * dx + dy * dy;
    };
    Point.prototype.normalizeSelf = function () {
        var length = this.distTo(ORIGIN);
        if (length == 0) {
            this.x = 0;
            this.y = 1;
            return this;
        }
        this.x /= length;
        this.y /= length;
        return this;
    };
    Point.prototype.pointTowards = function (target, dist) {
        var diff = new Point(target.x - this.x, target.y - this.y);
        diff.normalizeSelf();
        return new Point(this.x + diff.x * dist, this.y + diff.y * dist);
    };
    Point.prototype.equals = function (o) {
        return o.x == this.x && o.y == this.y;
    };
    Point.prototype.add = function (point) {
        this.x += point.x;
        this.y += point.y;
        return this;
    };
    Point.prototype.sub = function (point) {
        this.x -= point.x;
        this.y -= point.y;
        return this;
    };
    return Point;
}());
exports.Point = Point;
var BasicFigure = /** @class */ (function () {
    function BasicFigure() {
    }
    BasicFigure.prototype.getClosestPoint = function (point) {
        return undefined;
    };
    BasicFigure.prototype.translate = function (from, to) {
    };
    BasicFigure.prototype.getRelatedFigures = function () {
        return this.getRootFigure().getDescendants();
    };
    BasicFigure.prototype.getRootFigure = function () {
        if (this.parentFigure) {
            return this.parentFigure.getRootFigure();
        }
        else {
            return this;
        }
    };
    BasicFigure.prototype.getDescendants = function () {
        var children = [this];
        for (var _i = 0, _a = this.childFigures; _i < _a.length; _i++) {
            var child = _a[_i];
            children.push(child);
            var descendants = child.getDescendants();
            for (var _b = 0, descendants_1 = descendants; _b < descendants_1.length; _b++) {
                var descendant = descendants_1[_b];
                children.push(descendant);
            }
        }
        return children;
    };
    BasicFigure.prototype.setLocked = function (lock) {
        for (var _i = 0, _a = this.childFigures; _i < _a.length; _i++) {
            var fig = _a[_i];
            fig.setLocked(lock);
        }
    };
    return BasicFigure;
}());
exports.BasicFigure = BasicFigure;
var ORIGIN = new Point(0, 0);
var PointFigure = /** @class */ (function (_super) {
    __extends(PointFigure, _super);
    function PointFigure(p, name) {
        if (name === void 0) { name = "point"; }
        var _this = _super.call(this) || this;
        _this.type = "point";
        _this.childFigures = [];
        _this.parentFigure = null;
        _this.p = p;
        main_1.protractr.sketch.addVariable(_this.p.variablePoint.x);
        main_1.protractr.sketch.addVariable(_this.p.variablePoint.y);
        return _this;
    }
    PointFigure.prototype.getClosestPoint = function (point) {
        return this.p.copy();
    };
    PointFigure.prototype.translate = function (from, to) {
        this.p.set(to);
    };
    PointFigure.prototype.setLocked = function (lock) {
        _super.prototype.setLocked.call(this, lock);
        this.p.variablePoint.x.constant = lock;
        this.p.variablePoint.y.constant = lock;
    };
    return PointFigure;
}(BasicFigure));
exports.PointFigure = PointFigure;
var LineFigure = /** @class */ (function (_super) {
    __extends(LineFigure, _super);
    function LineFigure(p1, p2) {
        var _this = _super.call(this) || this;
        _this.type = "line";
        _this.p1 = p1;
        _this.p2 = p2;
        _this.childFigures = [new PointFigure(_this.p1, "p1"), new PointFigure(_this.p2, "p2")];
        _this.childFigures[0].parentFigure = _this;
        _this.childFigures[1].parentFigure = _this;
        return _this;
    }
    LineFigure.prototype.projectionFactor = function (point) {
        if (this.p1.equals(point))
            return 0;
        if (this.p2.equals(point))
            return 1;
        var dx = this.p1.x - this.p2.x;
        var dy = this.p1.y - this.p2.y;
        var len2 = dx * dx + dy * dy;
        return -((point.x - this.p1.x) * dx + (point.y - this.p1.y) * dy) / len2;
    };
    LineFigure.prototype.segmentFraction = function (point) {
        var segFrac = this.projectionFactor(point);
        if (segFrac < 0)
            return 0;
        if (segFrac > 1 || isNaN(segFrac))
            return 1;
        return segFrac;
    };
    LineFigure.prototype.project = function (point) {
        var r = this.segmentFraction(point);
        var px = this.p1.x + r * (this.p2.x - this.p1.x);
        var py = this.p1.y + r * (this.p2.y - this.p1.y);
        return new Point(px, py);
    };
    LineFigure.prototype.getClosestPoint = function (point) {
        return this.project(point);
    };
    LineFigure.prototype.translate = function (from, to) {
        var diff = to.sub(from).copy();
        this.p1.add(diff);
        this.p2.add(diff);
    };
    return LineFigure;
}(BasicFigure));
exports.LineFigure = LineFigure;
var CircleFigure = /** @class */ (function (_super) {
    __extends(CircleFigure, _super);
    function CircleFigure(c, r) {
        var _this = _super.call(this) || this;
        _this.type = "circle";
        _this.c = c;
        _this.r = new constraint_1.Variable(r);
        main_1.protractr.sketch.addVariable(_this.r);
        _this.childFigures = [new PointFigure(_this.c, "center")];
        _this.childFigures[0].parentFigure = _this;
        return _this;
    }
    CircleFigure.prototype.getClosestPoint = function (point) {
        return this.c.pointTowards(point, this.r.value);
    };
    CircleFigure.prototype.translate = function (from, to) {
        this.r.value = to.distTo(this.c);
    };
    CircleFigure.prototype.setLocked = function (lock) {
        _super.prototype.setLocked.call(this, lock);
        this.r.constant = lock;
    };
    return CircleFigure;
}(BasicFigure));
exports.CircleFigure = CircleFigure;

},{"../main":5,"./constraint":1}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("../main");
var typeMagnetism = {
    circle: 0,
    line: 0,
    point: 5,
};
var Sketch = /** @class */ (function () {
    function Sketch() {
        this.constraints = [];
        this.variables = [];
        this.rootFigures = [];
    }
    Sketch.prototype.getClosestFigure = function (point, ignoreFigures) {
        if (ignoreFigures === void 0) { ignoreFigures = []; }
        var allFigures = [];
        for (var _i = 0, _a = this.rootFigures; _i < _a.length; _i++) {
            var fig = _a[_i];
            allFigures.push.apply(allFigures, fig.getRelatedFigures());
        }
        var filteredFigures = allFigures.filter(function (value, index, arr) {
            return ignoreFigures.indexOf(value) == -1;
        });
        if (filteredFigures.length == 0)
            return null;
        var dist = filteredFigures[0].getClosestPoint(point).distTo(point);
        var closest = filteredFigures[0];
        for (var _b = 0, filteredFigures_1 = filteredFigures; _b < filteredFigures_1.length; _b++) {
            var fig = filteredFigures_1[_b];
            var p = fig.getClosestPoint(point);
            var d = p.distTo(point) - typeMagnetism[fig.type];
            if (d < dist) {
                closest = fig;
                dist = d;
            }
        }
        return closest;
    };
    Sketch.prototype.addConstraints = function (constraints) {
        for (var _i = 0, constraints_1 = constraints; _i < constraints_1.length; _i++) {
            var c = constraints_1[_i];
            this.constraints.push(c);
        }
        this.solveConstraints();
        main_1.protractr.ui.sketchView.draw();
    };
    Sketch.prototype.removeConstraint = function (constraint) {
        this.constraints = this.constraints.filter(function (value, index, arr) {
            return value != constraint;
        });
    };
    Sketch.prototype.addVariable = function (variable) {
        this.variables.push(variable);
    };
    Sketch.prototype.removeVariable = function (variable) {
        this.variables = this.variables.filter(function (value, index, arr) {
            return value != variable;
        });
    };
    Sketch.prototype.solveConstraints = function (tirelessSolve) {
        if (tirelessSolve === void 0) { tirelessSolve = false; }
        var count = 0;
        var previousError = 0;
        while (true) {
            var totalError = 0;
            for (var _i = 0, _a = this.constraints; _i < _a.length; _i++) {
                var constraint = _a[_i];
                totalError += constraint.getError();
            }
            if (totalError < 1)
                return true;
            if (count > 30 && !tirelessSolve)
                return false;
            var variableGradients = [];
            var contributorCount = [];
            for (var _b = 0, _c = this.variables; _b < _c.length; _b++) {
                var variable = _c[_b];
                var gradient = 0;
                var count_1 = 0;
                for (var _d = 0, _e = this.constraints; _d < _e.length; _d++) {
                    var constraint = _e[_d];
                    var g = constraint.getGradient(variable);
                    if (g != 0) {
                        gradient += g;
                        count_1++;
                    }
                }
                variableGradients.push(gradient);
                contributorCount.push(count_1);
            }
            for (var i = 0; i < variableGradients.length; i++) {
                this.variables[i].value += variableGradients[i] / (1 + contributorCount[i]);
            }
            count += 1;
            previousError = totalError;
        }
    };
    return Sketch;
}());
exports.Sketch = Sketch;

},{"../main":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var protractr_1 = require("./protractr");
var canvas;
var tools;
var sidePane;
var adjustCanvasResolution = function (event) {
    canvas.width = canvas.parentElement.clientWidth - 1;
    canvas.height = canvas.parentElement.clientHeight - 1;
    exports.protractr.ui.sketchView.draw();
};
window.addEventListener("resize", adjustCanvasResolution);
window.addEventListener("load", function () {
    canvas = document.getElementById("canvas");
    sidePane = document.getElementById("side-pane");
    tools = document.getElementById("tools");
    exports.protractr = new protractr_1.Protractr(canvas, sidePane, tools);
    adjustCanvasResolution(null);
    console.log("Protractr: ", exports.protractr);
});

},{"./protractr":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sketch_1 = require("./gcs/sketch");
var ui_1 = require("./ui/ui");
var Protractr = /** @class */ (function () {
    function Protractr(canvas, sidePane, toolbar) {
        this.sketch = new sketch_1.Sketch();
        this.ui = new ui_1.UI(this, canvas, sidePane, toolbar);
    }
    return Protractr;
}());
exports.Protractr = Protractr;

},{"./gcs/sketch":4,"./ui/ui":11}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("../main");
var constraint_filter_1 = require("../gcs/constraint_filter");
var InfoPane = /** @class */ (function () {
    function InfoPane(sidePane) {
        this.sidePane = sidePane;
        this.title = document.createElement("p");
        this.sidePane.appendChild(this.title);
        var d = document.createElement("p");
        d.innerText = "Possible Constraints:";
        this.sidePane.appendChild(d);
        this.possibleConstraints = document.createElement("div");
        this.sidePane.appendChild(this.possibleConstraints);
    }
    InfoPane.prototype.setFocusedFigures = function (figures) {
        if (figures === null || figures.length == 0) {
            this.title.innerText = "Nothing selected";
        }
        else if (figures.length == 1) {
            this.title.innerText = "Selected " + figures[0].type;
        }
        else {
            this.title.innerText = "Multiple things selected";
        }
        while (this.possibleConstraints.lastChild) {
            this.possibleConstraints.removeChild(this.possibleConstraints.lastChild);
        }
        var _loop_1 = function (pc) {
            var child = document.createElement("button");
            child.innerText = pc.name;
            child.addEventListener("click", function () {
                main_1.protractr.sketch.addConstraints(pc.createConstraints(figures));
            });
            this_1.possibleConstraints.appendChild(child);
        };
        var this_1 = this;
        for (var _i = 0, _a = constraint_filter_1.getSatisfiedConstraintFilters(figures); _i < _a.length; _i++) {
            var pc = _a[_i];
            _loop_1(pc);
        }
    };
    return InfoPane;
}());
exports.InfoPane = InfoPane;

},{"../gcs/constraint_filter":2,"../main":5}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var figures_1 = require("../gcs/figures");
var SketchView = /** @class */ (function () {
    function SketchView(ui, sketch, canvas) {
        this.dragging = false;
        this.lastPanPoint = null;
        this.ui = ui;
        this.sketch = sketch;
        this.canvas = canvas;
        this.selectedFigures = [];
        this.ctxScale = 1;
        this.ctxOrigin = new figures_1.Point(0, 0);
        this.updateSelected();
        this.ctx = this.canvas.getContext("2d");
        var mouseEventHandler = this.handleMouseEvent.bind(this);
        var events = ["mousemove", "mousedown", "mouseup", "wheel"];
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var event_1 = events_1[_i];
            this.canvas.addEventListener(event_1, mouseEventHandler);
        }
    }
    SketchView.prototype.handleZoomEvent = function (deltaY, point) {
        var originalScale = this.ctxScale;
        this.ctxScale = this.ctxScale - (deltaY * 0.05 * this.ctxScale);
        var scaleChange = originalScale - this.ctxScale;
        this.ctxOrigin.x += (point.x * scaleChange);
        this.ctxOrigin.y += (point.y * scaleChange);
    };
    SketchView.prototype.handlePanEvent = function (type, offset) {
        switch (type) {
            case "mousedown":
                this.lastPanPoint = offset.copy();
                break;
            case "mousemove":
                this.ctxOrigin.x += offset.x - this.lastPanPoint.x;
                this.ctxOrigin.y += offset.y - this.lastPanPoint.y;
                this.lastPanPoint = offset.copy();
                break;
            case "mouseup":
                this.lastPanPoint = null;
                break;
        }
    };
    SketchView.prototype.handleToolEvent = function (type, point) {
        switch (type) {
            case "mousedown":
                this.subscribedTool.down(point);
                break;
            case "mousemove":
                this.subscribedTool.move(point);
                break;
            case "mouseup":
                this.subscribedTool.up(point);
                break;
        }
    };
    SketchView.prototype.handleDragEvent = function (type, point) {
        switch (type) {
            case "mousedown":
                if (this.hoveredFigure) {
                    this.dragging = false;
                    this.draggedFigure = this.hoveredFigure;
                    this.lastFigureDrag = point.copy();
                }
                break;
            case "mousemove":
                if (this.draggedFigure != null) {
                    this.dragging = true;
                    this.draggedFigure.setLocked(false);
                    this.draggedFigure.translate(this.lastFigureDrag, point.copy());
                    this.draggedFigure.setLocked(true);
                    this.lastFigureDrag = point.copy();
                    this.sketch.solveConstraints();
                }
                break;
            case "mouseup":
                if (this.dragging === false) {
                    if (this.hoveredFigure) {
                        this.toggleSelected(this.hoveredFigure);
                    }
                    else {
                        this.selectedFigures = [];
                        this.updateSelected();
                    }
                }
                if (this.draggedFigure) {
                    this.draggedFigure.setLocked(false);
                    this.draggedFigure = null;
                    this.sketch.solveConstraints(true);
                }
                this.dragging = false;
                break;
        }
    };
    SketchView.prototype.handleMouseEvent = function (event) {
        event.preventDefault();
        var offset = new figures_1.Point(event.offsetX, event.offsetY);
        var scaled = new figures_1.Point(offset.x / this.ctxScale, offset.y / this.ctxScale);
        var point = new figures_1.Point(scaled.x - this.ctxOrigin.x / this.ctxScale, scaled.y - this.ctxOrigin.y / this.ctxScale);
        this.updateHover(point);
        var snapPoint = point; //this.snapPoint(point);
        if (event.type == "wheel") {
            this.handleZoomEvent(event.deltaY, point);
        }
        if (event.which == 2 || (event.type == "mousemove" && this.lastPanPoint != null)) {
            this.handlePanEvent(event.type, offset);
        }
        if (event.which == 1) {
            if (this.subscribedTool) {
                this.handleToolEvent(event.type, snapPoint);
            }
            else {
                this.handleDragEvent(event.type, snapPoint);
            }
        }
        this.draw();
    };
    SketchView.prototype.updateHover = function (point) {
        var closest;
        var ignoredFigures = [];
        if (this.subscribedTool && this.subscribedTool.currentFigure) {
            ignoredFigures.push.apply(ignoredFigures, this.subscribedTool.currentFigure.getRelatedFigures());
        }
        if (this.draggedFigure && this.dragging) {
            ignoredFigures.push.apply(ignoredFigures, this.draggedFigure.getRelatedFigures());
        }
        closest = this.sketch.getClosestFigure(point, ignoredFigures);
        if (closest != null && closest.getClosestPoint(point).distTo(point) > 10 / this.ctxScale) {
            closest = null;
        }
        this.hoveredFigure = closest;
        if (this.hoveredFigure != null) {
            this.setCursor("move");
        }
        else {
            this.setCursor("default");
        }
    };
    SketchView.prototype.subscribeTool = function (tool) {
        this.subscribedTool = tool;
    };
    SketchView.prototype.snapPoint = function (point) {
        if (!this.hoveredFigure)
            return point;
        return this.hoveredFigure.getClosestPoint(point);
    };
    SketchView.prototype.toggleSelected = function (fig) {
        if (this.selectedFigures.indexOf(fig) == -1) {
            this.selectedFigures.push(fig);
        }
        else {
            this.selectedFigures = this.selectedFigures.filter(function (value, index, arr) {
                return value != fig;
            });
        }
        this.updateSelected();
    };
    SketchView.prototype.updateSelected = function () {
        this.ui.infoPane.setFocusedFigures(this.selectedFigures);
    };
    SketchView.prototype.setCursor = function (cursor) {
        this.canvas.style.cursor = cursor;
    };
    SketchView.prototype.drawFigure = function (fig) {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2 / this.ctxScale;
        var pointSize = 3 / this.ctxScale;
        if (this.hoveredFigure == fig) {
            pointSize = 5 / this.ctxScale;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        if (this.selectedFigures.indexOf(fig) != -1) {
            this.ctx.strokeStyle = "#5e9cff";
        }
        switch (fig.type) {
            case "line":
                var line = fig;
                this.ctx.beginPath();
                this.ctx.moveTo(line.p1.x, line.p1.y);
                this.ctx.lineTo(line.p2.x, line.p2.y);
                this.ctx.stroke();
                break;
            case "point":
                var point = fig;
                this.drawPoint(point.p, pointSize, this.ctx.strokeStyle);
                break;
            case "circle":
                var circle = fig;
                this.ctx.beginPath();
                this.ctx.arc(circle.c.x, circle.c.y, circle.r.value, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
        }
    };
    SketchView.prototype.draw = function () {
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.translate(this.ctxOrigin.x, this.ctxOrigin.y);
        this.ctx.scale(this.ctxScale, this.ctxScale);
        for (var _i = 0, _a = this.sketch.rootFigures; _i < _a.length; _i++) {
            var fig = _a[_i];
            for (var _b = 0, _c = fig.getRelatedFigures(); _b < _c.length; _b++) {
                var child = _c[_b];
                this.drawFigure(child);
            }
        }
    };
    SketchView.prototype.drawPoint = function (point, size, color) {
        if (size === void 0) { size = 3; }
        if (color === void 0) { color = "black"; }
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        this.ctx.fill();
    };
    return SketchView;
}());
exports.SketchView = SketchView;

},{"../gcs/figures":3}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tools_1 = require("./tools");
var Toolbar = /** @class */ (function () {
    function Toolbar(toolbarElement, sketchView) {
        this.sketchView = sketchView;
        this.toolbarElement = toolbarElement;
        this.toolElements = [];
        this.initializeTools();
    }
    Toolbar.prototype.initializeTools = function () {
        this.addTool(new tools_1.PointTool(), "point.png");
        this.addTool(new tools_1.LineTool(), "line.png");
        this.addTool(new tools_1.CircleTool(), "circle.png");
        this.addTool(new tools_1.Tool("Arc", "Create an arc"), "arc.png");
        this.addTool(new tools_1.UndoTool(), "undo.png");
        this.addTool(new tools_1.RedoTool(), "redo.png");
    };
    Toolbar.prototype.addTool = function (tool, image) {
        var e = new ToolElement(tool, image);
        e.tool.toolbar = this;
        this.toolElements.push(e);
        this.toolbarElement.appendChild(e.li);
    };
    Toolbar.prototype.setActive = function (tool) {
        this.sketchView.subscribeTool(tool);
        for (var _i = 0, _a = this.toolElements; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.tool == tool) {
                e.activate();
            }
            else {
                e.deactivate();
            }
        }
        this.sketchView.draw();
    };
    return Toolbar;
}());
exports.Toolbar = Toolbar;
var ToolElement = /** @class */ (function () {
    function ToolElement(tool, image) {
        this.tool = tool;
        this.li = document.createElement("li");
        this.li.title = tool.tooltip;
        this.li.classList.add("tool");
        this.li.style.backgroundImage = "url('../image/" + image + "')";
        this.li.addEventListener("click", this.tool.used.bind(tool));
    }
    ToolElement.prototype.activate = function () {
        this.li.classList.add("tool-active");
        this.tool.active = true;
    };
    ToolElement.prototype.deactivate = function () {
        this.li.classList.remove("tool-active");
        this.tool.active = false;
    };
    return ToolElement;
}());

},{"./tools":10}],10:[function(require,module,exports){
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
var figures_1 = require("../gcs/figures");
var main_1 = require("../main");
var Tool = /** @class */ (function () {
    function Tool(name, tooltip) {
        this.name = name;
        this.tooltip = tooltip;
    }
    Tool.prototype.used = function () {
    };
    Tool.prototype.down = function (point) {
    };
    Tool.prototype.up = function (point) {
    };
    Tool.prototype.move = function (point) {
    };
    return Tool;
}());
exports.Tool = Tool;
var UndoTool = /** @class */ (function (_super) {
    __extends(UndoTool, _super);
    function UndoTool() {
        return _super.call(this, "Undo", "Undo the most recent action") || this;
    }
    UndoTool.prototype.used = function () {
        alert("Undo");
    };
    return UndoTool;
}(Tool));
exports.UndoTool = UndoTool;
var RedoTool = /** @class */ (function (_super) {
    __extends(RedoTool, _super);
    function RedoTool() {
        return _super.call(this, "Redo", "Redo the most recent undo") || this;
    }
    RedoTool.prototype.used = function () {
        alert("Redo");
    };
    return RedoTool;
}(Tool));
exports.RedoTool = RedoTool;
var ActivatableTool = /** @class */ (function (_super) {
    __extends(ActivatableTool, _super);
    function ActivatableTool() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.active = false;
        return _this;
    }
    ActivatableTool.prototype.used = function () {
        if (this.active) {
            this.toolbar.setActive(null);
            this.active = false;
            if (this.currentFigure != null) {
                this.currentFigure = null;
                main_1.protractr.sketch.rootFigures.pop();
            }
        }
        else {
            this.toolbar.setActive(this);
            this.active = true;
        }
    };
    return ActivatableTool;
}(Tool));
exports.ActivatableTool = ActivatableTool;
var FigureTool = /** @class */ (function (_super) {
    __extends(FigureTool, _super);
    function FigureTool() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FigureTool.prototype.move = function (point) {
        if (!this.currentPoint) {
            this.currentPoint = point.copy();
            this.points.push(this.currentPoint);
        }
        this.currentPoint.set(point);
    };
    FigureTool.prototype.up = function (point) {
        if (!this.currentPoint)
            return;
        this.currentPoint = point.copy();
        this.points.push(this.currentPoint);
    };
    return FigureTool;
}(ActivatableTool));
exports.FigureTool = FigureTool;
var PointTool = /** @class */ (function (_super) {
    __extends(PointTool, _super);
    function PointTool() {
        return _super.call(this, "Point", "Create a point") || this;
    }
    PointTool.prototype.up = function (point) {
        if (this.currentFigure) {
            this.currentFigure = null;
        }
    };
    PointTool.prototype.move = function (point) {
        if (this.currentFigure) {
            this.currentFigure.p.set(point);
        }
        else {
            this.currentFigure = new figures_1.PointFigure(point);
            main_1.protractr.sketch.rootFigures.push(this.currentFigure);
        }
    };
    return PointTool;
}(FigureTool));
exports.PointTool = PointTool;
var LineTool = /** @class */ (function (_super) {
    __extends(LineTool, _super);
    function LineTool() {
        var _this = _super.call(this, "Line", "Create a line") || this;
        _this.hasSetP1 = false;
        return _this;
    }
    LineTool.prototype.up = function (point) {
        if (this.currentFigure) {
            if (this.hasSetP1) {
                this.currentFigure.p2.set(point);
                this.currentFigure = null;
            }
            else {
                this.hasSetP1 = true;
                this.currentFigure.p1.set(point);
            }
        }
    };
    LineTool.prototype.move = function (point) {
        if (this.currentFigure) {
            if (!this.hasSetP1) {
                this.currentFigure.p1.set(point);
            }
            this.currentFigure.p2.set(point);
        }
        else {
            this.hasSetP1 = false;
            this.currentFigure = new figures_1.LineFigure(point, point.copy());
            main_1.protractr.sketch.rootFigures.push(this.currentFigure);
        }
    };
    return LineTool;
}(FigureTool));
exports.LineTool = LineTool;
var CircleTool = /** @class */ (function (_super) {
    __extends(CircleTool, _super);
    function CircleTool() {
        var _this = _super.call(this, "Circle", "Create a circle") || this;
        _this.hasSetC = false;
        return _this;
    }
    CircleTool.prototype.up = function (point) {
        if (this.currentFigure) {
            if (this.hasSetC) {
                this.currentFigure.r.value = this.currentFigure.c.distTo(point);
                this.currentFigure = null;
            }
            else {
                this.hasSetC = true;
                this.currentFigure.c.set(point);
            }
        }
        return true;
    };
    CircleTool.prototype.move = function (point) {
        if (this.currentFigure) {
            if (!this.hasSetC) {
                this.currentFigure.c.set(point);
            }
            this.currentFigure.r.value = this.currentFigure.c.distTo(point);
        }
        else {
            this.hasSetC = false;
            this.currentFigure = new figures_1.CircleFigure(point, 0);
            main_1.protractr.sketch.rootFigures.push(this.currentFigure);
        }
    };
    return CircleTool;
}(FigureTool));
exports.CircleTool = CircleTool;

},{"../gcs/figures":3,"../main":5}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toolbar_1 = require("./toolbar");
var infopane_1 = require("./infopane");
var sketchview_1 = require("./sketchview");
var UI = /** @class */ (function () {
    function UI(protractr, canvas, sidePane, toolbar) {
        this.protractr = protractr;
        this.infoPane = new infopane_1.InfoPane(sidePane);
        this.sketchView = new sketchview_1.SketchView(this, this.protractr.sketch, canvas);
        this.toolbar = new toolbar_1.Toolbar(toolbar, this.sketchView);
    }
    return UI;
}());
exports.UI = UI;

},{"./infopane":7,"./sketchview":8,"./toolbar":9}]},{},[5]);
