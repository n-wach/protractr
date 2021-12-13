(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/**
 * @module gcs/filterString
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var circle_1 = require("./geometry/circle");
var line_1 = require("./geometry/line");
var point_1 = require("./geometry/point");
/**
 * See type definitions
 * - TypeMatches are joined by & to form a TypeMatchExpression
 * - TypeMaps take the form "type as n type" such as "line as 2 point"
 * - TypeMaps are joined by , to form a TypeMapList
 * - MappedTypedMatchExpressionLists are formed as TypeMapList:TypeMatchExpression
 * - MappedTypedMatchExpressionLists are joined by | to form
 * - MatchQuantifier can be a number, a range (number-number), number+ or * (0+) or empty (1)
 */
var FilterString = /** @class */ (function () {
    function FilterString(str) {
        this.filterString = str;
        this.filter = this.parseFilter(this.filterString);
    }
    FilterString.prototype.parseFilter = function (filterString) {
        var filter = [];
        for (var _i = 0, _a = filterString.split("|"); _i < _a.length; _i++) {
            var mappedTypeMatchExpressionList = _a[_i];
            filter.push(this.parseFilterCase(mappedTypeMatchExpressionList));
        }
        return filter;
    };
    FilterString.prototype.parseFilterCase = function (filterCase) {
        var split = filterCase.split(":");
        var mapList = split[0] ? this.parseTypeMapList(split[0]) : [];
        var matchExpressionList = this.parseTypeMatchExpressionList(split[1]);
        return { mappings: mapList, expressions: matchExpressionList };
    };
    FilterString.prototype.parseTypeMapList = function (typeMapList) {
        var maps = [];
        for (var _i = 0, _a = typeMapList.split(","); _i < _a.length; _i++) {
            var typeMap = _a[_i];
            maps.push(this.parseTypeMap(typeMap));
        }
        return maps;
    };
    FilterString.prototype.parseTypeMap = function (typeMap) {
        var split = typeMap.split(" ");
        var fromType = split[0];
        //let as = split[1];
        var toTypeCount = parseInt(split[2]);
        var toType = split[3];
        return { from: fromType, count: toTypeCount, to: toType };
    };
    FilterString.prototype.parseTypeMatchExpressionList = function (typeMatchExpressionList) {
        var expressions = [];
        for (var _i = 0, _a = typeMatchExpressionList.split(","); _i < _a.length; _i++) {
            var typeMatchExpression = _a[_i];
            expressions.push(this.parseTypeMatchExpression(typeMatchExpression));
        }
        return expressions;
    };
    FilterString.prototype.parseTypeMatchExpression = function (typeMatchExpression) {
        var matches = [];
        for (var _i = 0, _a = typeMatchExpression.split("&"); _i < _a.length; _i++) {
            var typeMatch = _a[_i];
            matches.push(this.parseTypeMatch(typeMatch));
        }
        return matches;
    };
    FilterString.prototype.parseTypeMatch = function (typeMatch) {
        for (var i = 0; i < typeMatch.length; i++) {
            if (typeMatch[i].toLowerCase() != typeMatch[i].toUpperCase()) {
                //we've hit a letter!
                var quantifier = typeMatch.substr(0, i);
                if (quantifier == "*")
                    quantifier = "0+";
                if (quantifier == "" || quantifier == undefined)
                    quantifier = "1";
                var type = typeMatch.substr(i);
                return { quantifier: quantifier, type: type };
            }
        }
        console.error("Invalid TypeMatch:", typeMatch);
        return { quantifier: "0", type: "point" };
    };
    FilterString.prototype.satisfiesFilter = function (figures) {
        var rawTypes = {};
        for (var _i = 0, figures_1 = figures; _i < figures_1.length; _i++) {
            var fig = figures_1[_i];
            var type = getFigureTypeString(fig);
            if (rawTypes[type] === undefined) {
                rawTypes[type] = 1;
            }
            else {
                rawTypes[type] += 1;
            }
        }
        for (var _a = 0, _b = this.filter; _a < _b.length; _a++) {
            var filterCase = _b[_a];
            var typeCopy = {};
            for (var key in rawTypes) {
                typeCopy[key] = rawTypes[key];
            }
            if (this.satisfiesFilterCase(filterCase, typeCopy))
                return true;
        }
        return false;
    };
    FilterString.prototype.satisfiesFilterCase = function (filterCase, types) {
        for (var _i = 0, _a = filterCase.mappings; _i < _a.length; _i++) {
            var typeMapping = _a[_i];
            this.mapTypes(typeMapping, types);
        }
        for (var _b = 0, _c = filterCase.expressions; _b < _c.length; _b++) {
            var expression = _c[_b];
            if (this.satisfiesTypeMatchExpression(expression, types))
                return true;
        }
        return false;
    };
    FilterString.prototype.mapTypes = function (typeMapping, types) {
        if (types[typeMapping.from] !== undefined) {
            var additionalTypes = types[typeMapping.from] * typeMapping.count;
            delete types[typeMapping.from];
            if (types[typeMapping.to] === undefined) {
                types[typeMapping.to] = additionalTypes;
            }
            else {
                types[typeMapping.to] += additionalTypes;
            }
        }
    };
    FilterString.prototype.satisfiesTypeMatchExpression = function (expression, types) {
        var addressedTypes = {};
        for (var _i = 0, expression_1 = expression; _i < expression_1.length; _i++) {
            var typeMatch = expression_1[_i];
            if (!this.satisfiesTypeMatch(typeMatch, types))
                return false;
            addressedTypes[typeMatch.type] = true;
        }
        for (var type in types) {
            //all types must be addressed.
            if (!addressedTypes[type])
                return false;
        }
        return true;
    };
    FilterString.prototype.satisfiesTypeMatch = function (typeMatch, types) {
        var count = types[typeMatch.type];
        var quantifier = typeMatch.quantifier;
        if (quantifier.indexOf("-") != -1) {
            //range
            var min = parseInt(quantifier.substr(0, quantifier.indexOf("-") - 1));
            var max = parseInt(quantifier.substr(quantifier.indexOf("-") + 1));
            return count >= min && count <= max;
        }
        if (quantifier.indexOf("+") != -1) {
            //min+
            var min = parseInt(quantifier.substr(0, quantifier.indexOf("+")));
            return count >= min;
        }
        var exact = parseInt(quantifier);
        return count == exact;
    };
    return FilterString;
}());
exports.default = FilterString;
function getFigureTypeString(figure) {
    if (figure instanceof point_1.default)
        return "point";
    if (figure instanceof line_1.default)
        return "line";
    if (figure instanceof circle_1.default)
        return "circle";
    return null;
}
exports.getFigureTypeString = getFigureTypeString;

},{"./geometry/circle":3,"./geometry/line":5,"./geometry/point":6}],2:[function(require,module,exports){
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
 * @module gcs/geometry
 */
/** */
var point_1 = require("./point");
var util_1 = require("./util");
var circle_1 = require("./circle");
var Arc = /** @class */ (function (_super) {
    __extends(Arc, _super);
    function Arc(c, r, a0, a1) {
        var _this = _super.call(this, c, r) || this;
        var p0 = util_1.default.pointAtAngle(c, r, a0);
        _this.p0 = new ArcPoint(_this, p0.x, p0.y);
        var p1 = util_1.default.pointAtAngle(c, r, a1);
        _this.p1 = new ArcPoint(_this, p1.x, p1.y);
        return _this;
    }
    Arc.prototype.setConstant = function (c) {
        this.c.constant = c;
        this._r.constant = c;
    };
    Object.defineProperty(Arc.prototype, "r", {
        get: function () {
            return this._r.v;
        },
        set: function (v) {
            this._r.v = Math.max(v, 0);
            var p0 = util_1.default.pointInDirection(this.c, this.p0, this.r);
            this.p0.x = p0.x;
            this.p0.y = p0.y;
            var p1 = util_1.default.pointInDirection(this.c, this.p1, this.r);
            this.p1.x = p1.x;
            this.p1.y = p1.y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "angle0", {
        get: function () {
            return util_1.default.getAngleBetween(this.c, this.p0);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "angle1", {
        get: function () {
            return util_1.default.getAngleBetween(this.c, this.p1);
        },
        enumerable: true,
        configurable: true
    });
    Arc.prototype.equals = function (other) {
        if (!(other instanceof Arc))
            return false;
        return other.c.equals(this.c) && other.r == this.r &&
            other.angle0 == this.angle0 && other.angle1 == this.angle1;
    };
    Arc.prototype.getChildFigures = function () {
        return [this.c, this.p0, this.p1];
    };
    Arc.prototype.getClosestPoint = function (point) {
        return util_1.default.projectOntoArc(this, point);
    };
    Arc.prototype.translate = function (from, to) {
        this.r = util_1.default.distanceBetweenPoints(to, this.c);
    };
    Arc.prototype.copy = function () {
        return new Arc(this.c.copy(), this.r, this.angle0, this.angle1);
    };
    return Arc;
}(circle_1.default));
exports.default = Arc;
var ArcPoint = /** @class */ (function (_super) {
    __extends(ArcPoint, _super);
    function ArcPoint(arc, x, y) {
        var _this = _super.call(this, x, y) || this;
        _this.arc = arc;
        return _this;
    }
    ArcPoint.prototype.translate = function (from, to) {
        _super.prototype.translate.call(this, from, to);
        this.arc.r = util_1.default.distanceBetweenPoints(this.arc.c, this);
    };
    return ArcPoint;
}(point_1.default));
exports.ArcPoint = ArcPoint;

},{"./circle":3,"./point":6,"./util":7}],3:[function(require,module,exports){
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
var variable_1 = require("../variable");
var figure_1 = require("./figure");
var util_1 = require("./util");
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(c, r) {
        var _this = _super.call(this) || this;
        _this.c = c.copy();
        _this._r = new variable_1.default(r);
        return _this;
    }
    Circle.prototype.setConstant = function (c) {
        this.c.constant = c;
        this._r.constant = c;
    };
    Object.defineProperty(Circle.prototype, "r", {
        get: function () {
            return this._r.v;
        },
        set: function (v) {
            this._r.v = Math.max(v, 0);
        },
        enumerable: true,
        configurable: true
    });
    Circle.prototype.equals = function (other) {
        if (!(other instanceof Circle))
            return false;
        return other.c.equals(this.c) && other.r == this.r;
    };
    Circle.prototype.getChildFigures = function () {
        return [this.c];
    };
    Circle.prototype.getClosestPoint = function (point) {
        return util_1.default.projectOntoCircle(this, point);
    };
    Circle.prototype.translate = function (from, to) {
        this.r = util_1.default.distanceBetweenPoints(to, this.c);
    };
    Circle.prototype.copy = function () {
        return new Circle(this.c.copy(), this.r);
    };
    return Circle;
}(figure_1.default));
exports.default = Circle;

},{"../variable":19,"./figure":4,"./util":7}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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
 * @module gcs/geometry
 */
/** */
var figure_1 = require("./figure");
var util_1 = require("./util");
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(p0, p1) {
        var _this = _super.call(this) || this;
        _this.p0 = p0.copy();
        _this.p1 = p1.copy();
        return _this;
    }
    Line.prototype.getChildFigures = function () {
        return [this.p0, this.p1];
    };
    Line.prototype.getClosestPoint = function (point) {
        return util_1.default.projectOntoSegment(this, point);
    };
    Line.prototype.setConstant = function (c) {
        this.p0.constant = c;
        this.p1.constant = c;
    };
    Line.prototype.translate = function (from, to) {
        var dx = to.x - from.x;
        var dy = to.y - from.y;
        this.p0.x += dx;
        this.p0.y += dy;
        // If the values are linked, we only need to translate one of them
        if (this.p0._x._v !== this.p1._x._v) {
            this.p1.x += dx;
        }
        if (this.p0._y._v !== this.p1._y._v) {
            this.p1.y += dy;
        }
    };
    Line.prototype.equals = function (other) {
        if (!(other instanceof Line))
            return false;
        return other.p0.equals(this.p0) && other.p1.equals(this.p1);
    };
    Line.prototype.copy = function () {
        return new Line(this.p0.copy(), this.p1.copy());
    };
    return Line;
}(figure_1.default));
exports.default = Line;

},{"./figure":4,"./util":7}],6:[function(require,module,exports){
"use strict";
/**
 * @module gcs/geometry
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
var variable_1 = require("../variable");
var figure_1 = require("./figure");
var Point = /** @class */ (function (_super) {
    __extends(Point, _super);
    function Point(x, y) {
        var _this = _super.call(this) || this;
        _this.labelPosition = "center";
        _this._x = new variable_1.default(x);
        _this._y = new variable_1.default(y);
        return _this;
    }
    Object.defineProperty(Point.prototype, "x", {
        get: function () {
            return this._x.v;
        },
        set: function (v) {
            this._x.v = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Point.prototype, "y", {
        get: function () {
            return this._y.v;
        },
        set: function (v) {
            this._y.v = v;
        },
        enumerable: true,
        configurable: true
    });
    Point.prototype.getChildFigures = function () {
        return [];
    };
    Point.prototype.getClosestPoint = function (point) {
        return this.copy();
    };
    Point.prototype.setConstant = function (c) {
        this._x.constant = c;
        this._y.constant = c;
    };
    Point.prototype.translate = function (from, to) {
        this.x = to.x;
        this.y = to.y;
    };
    Point.prototype.equals = function (other) {
        if (!(other instanceof Point))
            return false;
        return other.x == this.x && other.y == this.y;
    };
    Point.prototype.copy = function () {
        return new Point(this.x, this.y);
    };
    return Point;
}(figure_1.default));
exports.default = Point;

},{"../variable":19,"./figure":4}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module gcs/geometry
 */
/** */
var line_1 = require("./line");
var point_1 = require("./point");
var Util = /** @class */ (function () {
    function Util() {
    }
    /**
     * Returns the average point
     * returns `new Point(avgX, avgY)`
     * @param points
     */
    Util.averageOfPoints = function () {
        var points = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            points[_i] = arguments[_i];
        }
        var x = 0;
        var y = 0;
        for (var _a = 0, points_1 = points; _a < points_1.length; _a++) {
            var point = points_1[_a];
            x += point.x;
            y += point.y;
        }
        return new point_1.default(x / points.length, y / points.length);
    };
    /**
     * Returns the length of the line
     * @param line
     */
    Util.lengthOfLine = function (line) {
        return Util.distanceBetweenPoints(line.p0, line.p1);
    };
    /**
     * Return the distance between p0 and p1
     * @param p0
     * @param p1
     */
    Util.distanceBetweenPoints = function (p0, p1) {
        var dx = p0.x - p1.x;
        var dy = p0.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    /**
     * Return the distance from point to its projection onto line
     * @param line
     * @param point
     */
    Util.distanceToLine = function (line, point) {
        var projection = Util.projectOntoLine(line, point);
        return Util.distanceBetweenPoints(point, projection);
    };
    /**
     * Return the distance from point to the closest point on segment
     * @param segment
     * @param point
     */
    Util.distanceToSegment = function (segment, point) {
        var projection = Util.projectOntoSegment(segment, point);
        return Util.distanceBetweenPoints(point, projection);
    };
    /**
     * Distance from point to the nearest point on circle
     * @param circle
     * @param point
     */
    Util.distanceToCircle = function (circle, point) {
        return Math.abs(Util.distanceBetweenPoints(circle.c, point) - circle.r);
    };
    /**
     *
     * @param point
     */
    Util.magnitudeOfPoint = function (point) {
        var x = point.x;
        var y = point.y;
        return Math.sqrt(x * x + y * y);
    };
    /**
     * Return a new point with the magnitude 1, pointing in the same direction
     * If the point has no magnitude, returns `new Point(0, 1)`
     * @param point
     */
    Util.normalize = function (point) {
        var mag = Util.magnitudeOfPoint(point);
        if (mag == 0) {
            return new point_1.default(0, 1);
        }
        return new point_1.default(point.x / mag, point.y / mag);
    };
    /**
     * Projects point onto circle.
     * If point in center of circle, returns top of circle.
     * @param point
     * @param circle
     */
    Util.projectOntoCircle = function (circle, point) {
        return Util.pointInDirection(circle.c, point, circle.r);
    };
    /**
     * Projects point onto arc
     * @param arc
     * @param point
     */
    Util.projectOntoArc = function (arc, point) {
        var angle = Util.getAngleBetween(arc.c, point);
        if (Util.isAngleBetween(arc.angle0, arc.angle1, angle)) {
            return Util.projectOntoCircle(arc, point);
        }
        var d0 = Util.distanceBetweenPoints(point, arc.p0);
        var d1 = Util.distanceBetweenPoints(point, arc.p1);
        if (d0 < d1) {
            return arc.p0.copy();
        }
        else {
            return arc.p1.copy();
        }
    };
    Util.isAngleBetween = function (startAngle, endAngle, angle) {
        endAngle = (endAngle - startAngle) < 0 ? endAngle - startAngle + Math.PI * 2 : endAngle - startAngle;
        angle = (angle - startAngle) < 0 ? angle - startAngle + Math.PI * 2 : angle - startAngle;
        return (angle < endAngle);
    };
    /**
     * Project point onto line. Point may not be on the line, but it will be co-linear.
     * @param point
     * @param line
     */
    Util.projectOntoLine = function (line, point) {
        var r = Util.projectionFactorBetween(line, point);
        return Util.pointAlongLine(line, r);
    };
    /**
     * Project point onto line, but make sure the point remains on the line
     * @param point
     * @param line
     */
    Util.projectOntoSegment = function (line, point) {
        var r = Util.projectionFactorBetween(line, point);
        if (r < 0)
            r = 0;
        else if (r > 1 || isNaN(r))
            r = 1;
        return Util.pointAlongLine(line, r);
    };
    /**
     * Return a point co-lienar with line, with a position determined by r.
     * r = 0: line.p0
     * r = 1: line.p1
     * Numbers outside of [0, 1] are valid.
     * @param r
     * @param line
     */
    Util.pointAlongLine = function (line, r) {
        var px = line.p0.x + r * (line.p1.x - line.p0.x);
        var py = line.p0.y + r * (line.p1.y - line.p0.y);
        return new point_1.default(px, py);
    };
    /**
     * Returns fraction of projection along line
     * 0 is line.p0, 1 is line.p1
     * @param point
     * @param line
     */
    Util.projectionFactorBetween = function (line, point) {
        if (line.p0.equals(point))
            return 0;
        if (line.p1.equals(point))
            return 1;
        var dx = line.p0.x - line.p1.x;
        var dy = line.p0.y - line.p1.y;
        var len2 = dx * dx + dy * dy;
        return -((point.x - line.p0.x) * dx + (point.y - line.p0.y) * dy) / len2;
    };
    /**
     * Determine if three points are clockwise (1), counterclockwise(-1) or colinear(0)
     * @param p0
     * @param p1
     * @param p2
     */
    Util.orientation = function (p0, p1, p2) {
        var val = (p1.y - p0.y) * (p2.x - p1.x) -
            (p1.x - p0.x) * (p2.y - p1.y);
        if (Math.abs(val) < 0.1)
            return 0; // colinear
        return (val > 0) ? 1 : -1; // clock or counterclock wise
    };
    /**
     * Given that point is co-linear to line, return if it lies on the line
     * @param point
     * @param line
     */
    Util.onSegment = function (line, point) {
        return point.x <= Math.max(line.p0.x, line.p1.x) &&
            point.x >= Math.min(line.p0.x, line.p1.x) &&
            point.y <= Math.max(line.p0.y, line.p1.y) &&
            point.y >= Math.min(line.p0.y, line.p1.y);
    };
    /**
     * Returns true if line0 intersects line1
     * @param line0
     * @param line1
     */
    Util.segmentsIntersect = function (line0, line1) {
        if (Util.lengthOfLine(line0) == 0 || Util.lengthOfLine(line1) == 0)
            return false;
        var o0 = Util.orientation(line0.p0, line0.p1, line1.p0);
        var o1 = Util.orientation(line0.p0, line0.p1, line1.p1);
        var o2 = Util.orientation(line1.p0, line1.p1, line0.p0);
        var o3 = Util.orientation(line1.p0, line1.p1, line0.p1);
        //General case
        if (o0 != o1 && o2 != o3)
            return true;
        // Special Cases
        if (o0 == 0 && Util.onSegment(line0, line1.p0))
            return true;
        if (o1 == 0 && Util.onSegment(line0, line1.p1))
            return true;
        if (o2 == 0 && Util.onSegment(line1, line0.p0))
            return true;
        if (o3 == 0 && Util.onSegment(line1, line0.p1))
            return true;
        return false;
    };
    /**
     * Return [variable, delta] pairs corresponding to changing point to goal.
     * @param point
     * @param goal
     */
    Util.pointDeltas = function (point, goal) {
        return [
            [point._x, goal.x - point.x],
            [point._y, goal.y - point.y],
        ];
    };
    /**
     * Return a point which is point reflected across pivot
     * @param point
     * @param pivot
     */
    Util.reflectOver = function (point, pivot) {
        var dx = point.x - pivot.x;
        var dy = point.y - pivot.y;
        return new point_1.default(point.x - dx * 2, point.y - dy * 2);
    };
    /**
     * Check for any forced regression lines.
     * These can be caused by constant variables or variable links
     * @param points
     */
    Util.forcedRegressionLine = function () {
        var points = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            points[_i] = arguments[_i];
        }
        // look for any constants
        var constantXPoints = [];
        var constantYPoints = [];
        var avgX = 0;
        var avgY = 0;
        for (var _a = 0, points_2 = points; _a < points_2.length; _a++) {
            var p = points_2[_a];
            avgX += p.x;
            avgY += p.y;
            if (p._x.constant)
                constantXPoints.push(p);
            if (constantXPoints.length >= 2) {
                return new line_1.default(constantXPoints[0], constantXPoints[1]);
            }
            if (p._y.constant)
                constantYPoints.push(p);
            if (constantYPoints.length >= 2) {
                return new line_1.default(constantYPoints[0], constantYPoints[1]);
            }
        }
        avgX /= points.length;
        avgY /= points.length;
        // we also check for linked variables... this will take care of
        // points with existing horizontal or vertical relations
        for (var _b = 0, points_3 = points; _b < points_3.length; _b++) {
            var p0 = points_3[_b];
            for (var _c = 0, points_4 = points; _c < points_4.length; _c++) {
                var p1 = points_4[_c];
                if (p0 === p1)
                    continue;
                if (p0._x._v === p1._x._v)
                    return new line_1.default(new point_1.default(avgX, p0.y), new point_1.default(avgX, p1.y));
                if (p0._y._v === p1._y._v)
                    return new line_1.default(new point_1.default(p0.x, avgY), new point_1.default(p1.x, avgY));
            }
        }
        return null;
    };
    /**
     * Return a line representing the least squares regression of points.
     * This returns the best regression out of x^2 and y^2.
     * @param points
     */
    Util.leastSquaresRegression = function () {
        var points = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            points[_i] = arguments[_i];
        }
        var xs = 0;
        var ys = 0;
        var x2s = 0;
        var y2s = 0;
        var xys = 0;
        var n = points.length;
        for (var _a = 0, points_5 = points; _a < points_5.length; _a++) {
            var p = points_5[_a];
            xs += p.x;
            ys += p.y;
            x2s += p.x * p.x;
            y2s += p.y * p.y;
            xys += p.x * p.y;
        }
        var numerator = (n * xys) - (xs * ys);
        var denominator = n * x2s - (xs * xs);
        if (denominator === 0 || Math.abs(numerator / denominator) > 1) {
            denominator = n * y2s - (ys * ys);
            var slope_1 = numerator / denominator;
            var xintercept = (xs - slope_1 * ys) / n;
            var p0_1 = new point_1.default(xintercept, 0);
            var p1_1 = new point_1.default(xintercept + slope_1, 1);
            return new line_1.default(p0_1, p1_1);
        }
        var slope = numerator / denominator;
        var yintercept = (ys - slope * xs) / n;
        var p0 = new point_1.default(0, yintercept);
        var p1 = new point_1.default(1, yintercept + slope);
        return new line_1.default(p0, p1);
    };
    /**
     * Return a point that is `distance` away from `from` in the direction of `to`
     * @param from
     * @param to
     * @param distance
     */
    Util.pointInDirection = function (from, to, distance) {
        // ray represents the direction from from to to
        var ray = new point_1.default(to.x - from.x, to.y - from.y);
        // now we set the magnitude of the ray to the distance
        var normalized = Util.normalize(ray);
        normalized.x *= distance;
        normalized.y *= distance;
        // then we translate the point back relative to from
        return new point_1.default(normalized.x + from.x, normalized.y + from.y);
    };
    /**
     * Returns if `point` is within the rectangle created by `corner0` and `corner1`
     * @param corner0
     * @param corner1
     * @param point
     */
    Util.pointWithinRectangle = function (corner0, corner1, point) {
        return ((corner0.x > point.x && corner1.x < point.x) ||
            (corner0.x < point.x && corner1.x > point.x)) && ((corner0.y > point.y && corner1.y < point.y) ||
            (corner0.y < point.y && corner1.y > point.y));
    };
    /**
     * Returns if `point` lies within `circle`
     * @param circle
     * @param point
     */
    Util.pointWithinCircle = function (circle, point) {
        return Util.distanceBetweenPoints(circle.c, point) <= circle.r;
    };
    /**
     * Returns if line intersects or is contained by circle
     * @param circle
     * @param line
     */
    Util.lineIntersectsCircle = function (circle, line) {
        return Util.distanceToSegment(line, circle.c) <= circle.r;
    };
    /**
     * Angle of the line from pivot to point in radians
     * @param pivot
     * @param point
     */
    Util.getAngleBetween = function (pivot, point) {
        var dx = point.x - pivot.x;
        var dy = point.y - pivot.y;
        return Math.atan2(dy, dx);
    };
    /**
     * Return a point `radius` away from `pivot` at the specified `angle`.
     * @param pivot
     * @param radius
     * @param angle
     */
    Util.pointAtAngle = function (pivot, radius, angle) {
        var x = Math.cos(angle) * radius;
        var y = Math.sin(angle) * radius;
        return new point_1.default(pivot.x + x, pivot.y + y);
    };
    return Util;
}());
exports.default = Util;

},{"./line":5,"./point":6}],8:[function(require,module,exports){
"use strict";
/**
 * @module gcs/relations
 */
/** */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var filterString_1 = require("../filterString");
var point_1 = require("../geometry/point");
var line_1 = require("../geometry/line");
var circle_1 = require("../geometry/circle");
var relationEqual_1 = require("./relationEqual");
var relationPointsOnCircle_1 = require("./relationPointsOnCircle");
var relationColinearPoints_1 = require("./relationColinearPoints");
var relationEqualLength_1 = require("./relationEqualLength");
var relationTangentCircle_1 = require("./relationTangentCircle");
var relationTangentLine_1 = require("./relationTangentLine");
var relationMidpoint_1 = require("./relationMidpoint");
var RelationCreator = /** @class */ (function () {
    function RelationCreator() {
    }
    RelationCreator.getSatisfiedEnvironments = function (figures) {
        var satisfied = [];
        for (var _i = 0, _a = this.environments; _i < _a.length; _i++) {
            var env = _a[_i];
            if (env.filter.satisfiesFilter(figures)) {
                satisfied.push(env);
            }
        }
        return satisfied;
    };
    RelationCreator.createRelations = function (figures, relenv) {
        var sorted = RelationCreator.sortFigureSelection(figures);
        return relenv.create(sorted);
    };
    RelationCreator.sortFigureSelection = function (figures) {
        var sortedFigures = {
            point: [],
            line: [],
            circle: [],
        };
        for (var _i = 0, figures_1 = figures; _i < figures_1.length; _i++) {
            var f = figures_1[_i];
            if (f instanceof point_1.default) {
                sortedFigures.point.push(f);
            }
            else if (f instanceof line_1.default) {
                sortedFigures.line.push(f);
            }
            else if (f instanceof circle_1.default) {
                sortedFigures.circle.push(f);
            }
        }
        return sortedFigures;
    };
    RelationCreator.environments = [
        {
            name: "horizontal",
            filter: new filterString_1.default(":2+point"),
            create: function (figures) {
                var ys = [];
                for (var _i = 0, _a = figures.point; _i < _a.length; _i++) {
                    var point = _a[_i];
                    ys.push(point._y);
                }
                return [new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "horizontal"], ys)))()];
            }
        },
        {
            name: "vertical",
            filter: new filterString_1.default(":2+point"),
            create: function (figures) {
                var xs = [];
                for (var _i = 0, _a = figures.point; _i < _a.length; _i++) {
                    var point = _a[_i];
                    xs.push(point._x);
                }
                return [new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "vertical"], xs)))()];
            }
        },
        {
            name: "horizontal",
            filter: new filterString_1.default(":1+line"),
            create: function (figures) {
                var relations = [];
                for (var _i = 0, _a = figures.line; _i < _a.length; _i++) {
                    var line = _a[_i];
                    relations.push(new relationEqual_1.default("horizontal", line.p0._y, line.p1._y));
                }
                return relations;
            }
        },
        {
            name: "vertical",
            filter: new filterString_1.default(":1+line"),
            create: function (figures) {
                var relations = [];
                for (var _i = 0, _a = figures.line; _i < _a.length; _i++) {
                    var line = _a[_i];
                    relations.push(new relationEqual_1.default("vertical", line.p0._x, line.p1._x));
                }
                return relations;
            }
        },
        {
            name: "coincident",
            filter: new filterString_1.default(":2+point"),
            create: function (figures) {
                var xs = [];
                var ys = [];
                for (var _i = 0, _a = figures.point; _i < _a.length; _i++) {
                    var point = _a[_i];
                    xs.push(point._x);
                    ys.push(point._y);
                }
                return [
                    new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "vertical"], xs)))(),
                    new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "horizontal"], ys)))(),
                ];
            }
        },
        {
            name: "equal radius",
            filter: new filterString_1.default(":2+circle"),
            create: function (figures) {
                var rs = [];
                for (var _i = 0, _a = figures.circle; _i < _a.length; _i++) {
                    var circle = _a[_i];
                    rs.push(circle._r);
                }
                return [new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "equal radius"], rs)))()];
            }
        },
        {
            name: "concentric",
            filter: new filterString_1.default(":2+circle,1+circle&*point"),
            create: function (figures) {
                var xs = [];
                var ys = [];
                for (var _i = 0, _a = figures.circle; _i < _a.length; _i++) {
                    var circle = _a[_i];
                    xs.push(circle.c._x);
                    ys.push(circle.c._y);
                }
                for (var _b = 0, _c = figures.point; _b < _c.length; _b++) {
                    var point = _c[_b];
                    xs.push(point._x);
                    ys.push(point._y);
                }
                return [
                    new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "vertical"], xs)))(),
                    new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, "horizontal"], ys)))()
                ];
            }
        },
        {
            name: "point on circle",
            filter: new filterString_1.default(":circle&1+point"),
            create: function (figures) {
                return [new (relationPointsOnCircle_1.default.bind.apply(relationPointsOnCircle_1.default, __spreadArrays([void 0, figures.circle[0]], figures.point)))()];
            }
        },
        {
            name: "circle intersection",
            filter: new filterString_1.default(":point&2+circle"),
            create: function (figures) {
                var p = figures.point[0];
                var relations = [];
                for (var _i = 0, _a = figures.circle; _i < _a.length; _i++) {
                    var circle = _a[_i];
                    relations.push(new relationPointsOnCircle_1.default(circle, p));
                }
                return relations;
            }
        },
        {
            name: "colinear",
            filter: new filterString_1.default("line as 2 point:3+point"),
            create: function (figures) {
                var points = figures.point;
                for (var _i = 0, _a = figures.line; _i < _a.length; _i++) {
                    var line = _a[_i];
                    points.push(line.p0);
                    points.push(line.p1);
                }
                return [new (relationColinearPoints_1.default.bind.apply(relationColinearPoints_1.default, __spreadArrays([void 0], points)))()];
            }
        },
        {
            name: "midpoint",
            filter: new filterString_1.default(":point&line"),
            create: function (figures) {
                return [new relationMidpoint_1.default(figures.point[0], figures.line[0])];
            }
        },
        {
            name: "line intersection",
            filter: new filterString_1.default(":point&2+line"),
            create: function (figures) {
                var p = figures.point[0];
                var relations = [];
                for (var _i = 0, _a = figures.line; _i < _a.length; _i++) {
                    var line = _a[_i];
                    relations.push(new relationColinearPoints_1.default(p, line.p0, line.p1));
                }
                return relations;
            }
        },
        {
            name: "equal length",
            filter: new filterString_1.default(":2+line"),
            create: function (figures) {
                return [new (relationEqualLength_1.default.bind.apply(relationEqualLength_1.default, __spreadArrays([void 0], figures.line)))()];
            }
        },
        {
            name: "tangent circles",
            filter: new filterString_1.default(":2circle"),
            create: function (figures) {
                return [new relationTangentCircle_1.default(figures.circle[0], figures.circle[1])];
            }
        },
        {
            name: "tangent line",
            filter: new filterString_1.default(":1circle&1line"),
            create: function (figures) {
                return [new relationTangentLine_1.default(figures.line[0], figures.circle[0])];
            }
        },
    ];
    return RelationCreator;
}());
exports.default = RelationCreator;

},{"../filterString":1,"../geometry/circle":3,"../geometry/line":5,"../geometry/point":6,"./relationColinearPoints":11,"./relationEqual":12,"./relationEqualLength":13,"./relationMidpoint":14,"./relationPointsOnCircle":15,"./relationTangentCircle":16,"./relationTangentLine":17}],9:[function(require,module,exports){
"use strict";
/**
 * @module gcs/relations
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var relationEqual_1 = require("./relationEqual");
var relationColinearPoints_1 = require("./relationColinearPoints");
var relationPointsOnCircle_1 = require("./relationPointsOnCircle");
var relationEqualLength_1 = require("./relationEqualLength");
var RelationManager = /** @class */ (function () {
    function RelationManager() {
        this.relations = [];
    }
    RelationManager.prototype.getTotalError = function () {
        var error = 0;
        for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
            var relation = _a[_i];
            error += relation.getError();
        }
        return error;
    };
    RelationManager.prototype.isSolved = function () {
        return this.getTotalError() < RelationManager.SOLVE_TOLERANCE;
    };
    RelationManager.prototype.solveRelations = function (tireless) {
        if (tireless === void 0) { tireless = false; }
        var startTime = new Date().getTime();
        var count = 1;
        while (true) {
            if (RelationManager.DEBUG_SOLVE && count >= 2)
                return; // debug shows only one iteration
            if (this.isSolved() && count > 10)
                return; // solved, still do a few iterations for fun though...
            if (!tireless && count > 150)
                return; // not tireless so we can give up quickly
            // even if tireless, we should still give up eventually...
            if (count % 10000 == 0) {
                var currentTime = new Date().getTime();
                if (currentTime - startTime > 1000)
                    return; //give up after one second.
            }
            var variableDeltas = [];
            for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
                var relation = _a[_i];
                variableDeltas.push.apply(variableDeltas, relation.getDeltas());
            }
            // sort variables by value reference and count contributors
            var values = new Map();
            for (var _b = 0, variableDeltas_1 = variableDeltas; _b < variableDeltas_1.length; _b++) {
                var variableDelta = variableDeltas_1[_b];
                var value = variableDelta[0]._v;
                var delta = variableDelta[1];
                if (values.has(value)) {
                    var valueDelta = values.get(value);
                    valueDelta.contributorCount += 1;
                    valueDelta.totalDelta += delta;
                }
                else {
                    values.set(value, {
                        contributorCount: 1,
                        totalDelta: delta,
                    });
                }
            }
            values.forEach((function (valueDelta, value) {
                var scaledDelta = valueDelta.totalDelta / (2 + valueDelta.contributorCount);
                value.v += scaledDelta;
            }));
            count += 1;
        }
    };
    RelationManager.prototype.addEqualAndMerge = function (newRelation) {
        var mergedVariables = newRelation.variables;
        for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (relation instanceof relationEqual_1.default) {
                if (RelationManager.doArraysIntersect(relation.variables, newRelation.variables)) {
                    for (var _b = 0, _c = relation.variables; _b < _c.length; _b++) {
                        var v = _c[_b];
                        if (mergedVariables.indexOf(v) == -1) {
                            mergedVariables.push(v);
                        }
                    }
                    var index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                }
            }
        }
        this.relations.push(newRelation);
    };
    RelationManager.prototype.addColinearAndMerge = function (newRelation) {
        var mergedPoints = newRelation.points;
        for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (relation instanceof relationColinearPoints_1.default) {
                if (RelationManager.doArraysIntersect(relation.points, newRelation.points, 2)) {
                    for (var _b = 0, _c = relation.points; _b < _c.length; _b++) {
                        var p = _c[_b];
                        if (mergedPoints.indexOf(p) == -1) {
                            mergedPoints.push(p);
                            newRelation.variables.push(p._x);
                            newRelation.variables.push(p._y);
                        }
                    }
                    var index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                }
            }
        }
        this.relations.push(newRelation);
    };
    RelationManager.prototype.addPointsOnCircleAndMerge = function (newRelation) {
        var mergedPoints = newRelation.points;
        for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (relation instanceof relationPointsOnCircle_1.default) {
                if (relation.circle == newRelation.circle) {
                    for (var _b = 0, _c = relation.points; _b < _c.length; _b++) {
                        var p = _c[_b];
                        if (mergedPoints.indexOf(p) == -1) {
                            mergedPoints.push(p);
                            newRelation.variables.push(p._x);
                            newRelation.variables.push(p._y);
                        }
                    }
                    var index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                    // Assuming good merging, there will be at most
                    // one other relation with the same circle
                    break;
                }
            }
        }
        this.relations.push(newRelation);
    };
    RelationManager.prototype.addEqualLengthAndMerge = function (newRelation) {
        var mergedLines = newRelation.lines;
        for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (relation instanceof relationEqualLength_1.default) {
                if (RelationManager.doArraysIntersect(relation.lines, newRelation.lines)) {
                    for (var _b = 0, _c = relation.lines; _b < _c.length; _b++) {
                        var l = _c[_b];
                        if (mergedLines.indexOf(l) == -1) {
                            mergedLines.push(l);
                            newRelation.variables.push(l.p0._x);
                            newRelation.variables.push(l.p0._y);
                            newRelation.variables.push(l.p1._x);
                            newRelation.variables.push(l.p1._y);
                        }
                    }
                    var index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                }
            }
        }
        this.relations.push(newRelation);
    };
    RelationManager.prototype.addRelationAndMerge = function (relation) {
        if (relation instanceof relationEqual_1.default) {
            this.addEqualAndMerge(relation);
        }
        else if (relation instanceof relationColinearPoints_1.default) {
            this.addColinearAndMerge(relation);
        }
        else if (relation instanceof relationPointsOnCircle_1.default) {
            this.addPointsOnCircleAndMerge(relation);
        }
        else if (relation instanceof relationEqualLength_1.default) {
            this.addEqualLengthAndMerge(relation);
        }
        else {
            // no known merger
            this.relations.push(relation);
        }
    };
    RelationManager.prototype.addRelations = function () {
        var relations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            relations[_i] = arguments[_i];
        }
        for (var _a = 0, relations_1 = relations; _a < relations_1.length; _a++) {
            var relation = relations_1[_a];
            this.addRelationAndMerge(relation);
        }
        this.solveRelations(true);
    };
    RelationManager.prototype.removeRelation = function (relation) {
        var index = this.relations.indexOf(relation);
        if (index === -1)
            return;
        this.relations.splice(index, 1);
        relation.remove();
    };
    RelationManager.prototype.removeRelations = function () {
        var relations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            relations[_i] = arguments[_i];
        }
        for (var _a = 0, relations_2 = relations; _a < relations_2.length; _a++) {
            var relation = relations_2[_a];
            this.removeRelation(relation);
        }
    };
    /**
     * Are there at least minCount values in both array0 and array1
     * @param array0
     * @param array1
     * @param minCount
     */
    RelationManager.doArraysIntersect = function (array0, array1, minCount) {
        if (minCount === void 0) { minCount = 1; }
        if (array0.length == 0 || array1.length == 0)
            return false;
        var count = 0;
        for (var _i = 0, array0_1 = array0; _i < array0_1.length; _i++) {
            var v0 = array0_1[_i];
            if (array1.indexOf(v0) != -1)
                count++;
            if (count >= minCount)
                return true;
        }
        return false;
    };
    RelationManager.DEBUG_SOLVE = false;
    RelationManager.SOLVE_TOLERANCE = 1;
    return RelationManager;
}());
exports.default = RelationManager;

},{"./relationColinearPoints":11,"./relationEqual":12,"./relationEqualLength":13,"./relationPointsOnCircle":15}],10:[function(require,module,exports){
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

},{"../geometry/circle":3,"../geometry/line":5,"../geometry/point":6}],11:[function(require,module,exports){
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
var line_1 = require("../geometry/line");
var util_1 = require("../geometry/util");
var RelationColinearPoints = /** @class */ (function (_super) {
    __extends(RelationColinearPoints, _super);
    function RelationColinearPoints() {
        var points = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            points[_i] = arguments[_i];
        }
        var _this = _super.call(this, "colinear points") || this;
        _this.variables = [];
        for (var _a = 0, points_1 = points; _a < points_1.length; _a++) {
            var point = points_1[_a];
            _this.variables.push(point._x);
            _this.variables.push(point._y);
        }
        _this.points = points;
        return _this;
    }
    RelationColinearPoints.prototype.getDeltas = function () {
        var deltas = [];
        var regression = util_1.default.forcedRegressionLine.apply(util_1.default, this.points);
        if (!regression)
            regression = util_1.default.leastSquaresRegression.apply(util_1.default, this.points);
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            var projection = util_1.default.projectOntoLine(regression, point);
            deltas.push.apply(deltas, util_1.default.pointDeltas(point, projection));
        }
        return deltas;
    };
    RelationColinearPoints.prototype.getError = function () {
        var regression = util_1.default.forcedRegressionLine.apply(util_1.default, this.points);
        if (!regression)
            regression = util_1.default.leastSquaresRegression.apply(util_1.default, this.points);
        var error = 0;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            error += util_1.default.distanceToLine(regression, point);
        }
        return error;
    };
    RelationColinearPoints.prototype.getVariables = function () {
        return this.variables;
    };
    RelationColinearPoints.prototype.containsFigure = function (figure) {
        if (figure instanceof line_1.default)
            return false;
        return _super.prototype.containsFigure.call(this, figure);
    };
    return RelationColinearPoints;
}(relation_1.default));
exports.default = RelationColinearPoints;

},{"../geometry/line":5,"../geometry/util":7,"./relation":10}],12:[function(require,module,exports){
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
/**
 * Used to set multiple variables equal.  For instance,
 * horizontal/vertical points, or equal radius circles.
 * WARNING: this relation is unique in that it immediately links
 * variables and becomes active.  It does not need to be added to
 * a sketch to take affect...
 */
var RelationEqual = /** @class */ (function (_super) {
    __extends(RelationEqual, _super);
    function RelationEqual(name) {
        var variables = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            variables[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this, name) || this;
        _this.variables = variables;
        var root = _this.variables[0];
        for (var i = 1; i < _this.variables.length; i++) {
            _this.variables[i].linkValues(root);
        }
        return _this;
    }
    RelationEqual.prototype.getDeltas = function () {
        return [];
    };
    RelationEqual.prototype.getError = function () {
        return 0;
    };
    RelationEqual.prototype.getVariables = function () {
        return this.variables;
    };
    RelationEqual.prototype.remove = function () {
        for (var _i = 0, _a = this.variables; _i < _a.length; _i++) {
            var variable = _a[_i];
            variable.unlink();
        }
    };
    return RelationEqual;
}(relation_1.default));
exports.default = RelationEqual;

},{"./relation":10}],13:[function(require,module,exports){
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

},{"../geometry/util":7,"./relation":10}],14:[function(require,module,exports){
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
var RelationMidpoint = /** @class */ (function (_super) {
    __extends(RelationMidpoint, _super);
    function RelationMidpoint(point, line) {
        var _this = _super.call(this, "midpoint") || this;
        _this.variables = [
            point._x,
            point._y,
            line.p0._x,
            line.p0._y,
            line.p1._x,
            line.p1._y,
        ];
        _this.midpoint = point;
        _this.line = line;
        return _this;
    }
    RelationMidpoint.prototype.getDeltas = function () {
        var deltas = [];
        var midpoint = util_1.default.averageOfPoints(this.line.p0, this.line.p1);
        deltas.push.apply(deltas, util_1.default.pointDeltas(this.midpoint, midpoint));
        var reflectP0 = util_1.default.reflectOver(this.line.p0, this.midpoint);
        deltas.push.apply(deltas, util_1.default.pointDeltas(this.line.p1, reflectP0));
        var reflectP1 = util_1.default.reflectOver(this.line.p1, this.midpoint);
        deltas.push.apply(deltas, util_1.default.pointDeltas(this.line.p0, reflectP1));
        return deltas;
    };
    RelationMidpoint.prototype.getError = function () {
        var midpoint = util_1.default.averageOfPoints(this.line.p0, this.line.p1);
        return util_1.default.distanceBetweenPoints(this.midpoint, midpoint);
    };
    RelationMidpoint.prototype.getVariables = function () {
        return this.variables;
    };
    return RelationMidpoint;
}(relation_1.default));
exports.default = RelationMidpoint;

},{"../geometry/util":7,"./relation":10}],15:[function(require,module,exports){
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
var line_1 = require("../geometry/line");
var util_1 = require("../geometry/util");
var RelationPointsOnCircle = /** @class */ (function (_super) {
    __extends(RelationPointsOnCircle, _super);
    function RelationPointsOnCircle(circle) {
        var points = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            points[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this, "points on circle") || this;
        _this.variables = [
            circle._r,
            circle.c._x,
            circle.c._y,
        ];
        for (var _a = 0, points_1 = points; _a < points_1.length; _a++) {
            var point = points_1[_a];
            _this.variables.push(point._x);
            _this.variables.push(point._y);
        }
        _this.points = points;
        _this.circle = circle;
        return _this;
    }
    RelationPointsOnCircle.prototype.getDeltas = function () {
        var deltas = [];
        var totalDistance = 0;
        var centerXDelta = 0;
        var centerYDelta = 0;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            var dist = util_1.default.distanceBetweenPoints(point, this.circle.c);
            totalDistance += dist;
            var goalPoint = util_1.default.projectOntoCircle(this.circle, point);
            deltas.push.apply(deltas, util_1.default.pointDeltas(point, goalPoint));
            if (dist == 0)
                continue;
            var d = this.circle.r / dist;
            var dx = point.x - this.circle.c.x;
            var dy = point.y - this.circle.c.y;
            centerXDelta += (1 - d) * dx;
            centerYDelta += (1 - d) * dy;
        }
        var averageRadius = totalDistance / this.points.length;
        var dr = averageRadius - this.circle.r;
        deltas.push([this.circle._r, dr]);
        deltas.push([this.circle.c._x, centerXDelta]);
        deltas.push([this.circle.c._y, centerYDelta]);
        return deltas;
    };
    RelationPointsOnCircle.prototype.getError = function () {
        var error = 0;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            error += util_1.default.distanceToCircle(this.circle, point);
        }
        return error;
    };
    RelationPointsOnCircle.prototype.getVariables = function () {
        return this.variables;
    };
    RelationPointsOnCircle.prototype.containsFigure = function (figure) {
        if (figure instanceof line_1.default)
            return false;
        return _super.prototype.containsFigure.call(this, figure);
    };
    return RelationPointsOnCircle;
}(relation_1.default));
exports.default = RelationPointsOnCircle;

},{"../geometry/line":5,"../geometry/util":7,"./relation":10}],16:[function(require,module,exports){
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
var point_1 = require("../geometry/point");
var line_1 = require("../geometry/line");
var util_1 = require("../geometry/util");
var RelationTangentCircle = /** @class */ (function (_super) {
    __extends(RelationTangentCircle, _super);
    function RelationTangentCircle(circle0, circle1) {
        var _this = _super.call(this, "tangent circle") || this;
        _this.variables = [
            circle0._r,
            circle0.c._x,
            circle0.c._y,
            circle1._r,
            circle1.c._x,
            circle1.c._y,
        ];
        _this.circle0 = circle0;
        _this.circle1 = circle1;
        return _this;
    }
    RelationTangentCircle.prototype.getDeltas = function () {
        var deltas = [];
        var delta = 0;
        var c0Goal = null;
        var c1Goal = null;
        var dist = util_1.default.distanceBetweenPoints(this.circle0.c, this.circle1.c);
        if (dist >= Math.max(this.circle0.r, this.circle1.r)) {
            // circle centers are outside of each other
            var radiusSum = this.circle0.r + this.circle1.r;
            delta = dist - radiusSum;
            deltas.push([this.circle0._r, delta]);
            deltas.push([this.circle1._r, delta]);
            c0Goal = util_1.default.pointInDirection(this.circle0.c, this.circle1.c, delta);
            c1Goal = util_1.default.pointInDirection(this.circle1.c, this.circle0.c, delta);
        }
        else {
            // the circle with the smaller radius is inside the other circle
            if (this.circle0.r < this.circle1.r) {
                // circle0 inside circle1
                // delta is how to change r0
                delta = this.circle1.r - (dist + this.circle0.r);
                deltas.push([this.circle0._r, delta]);
                deltas.push([this.circle1._r, -delta]);
            }
            else {
                // circle1 inside circle0
                // delta is how to change r1
                delta = this.circle0.r - (dist + this.circle1.r);
                deltas.push([this.circle0._r, -delta]);
                deltas.push([this.circle1._r, delta]);
            }
            c0Goal = util_1.default.pointInDirection(this.circle0.c, this.circle1.c, -delta);
            c1Goal = util_1.default.pointInDirection(this.circle1.c, this.circle0.c, -delta);
        }
        deltas.push.apply(deltas, util_1.default.pointDeltas(this.circle0.c, c0Goal));
        deltas.push.apply(deltas, util_1.default.pointDeltas(this.circle1.c, c1Goal));
        return deltas;
    };
    RelationTangentCircle.prototype.getError = function () {
        var dist = util_1.default.distanceBetweenPoints(this.circle0.c, this.circle1.c);
        if (dist > Math.max(this.circle0.r, this.circle1.r)) {
            // circle centers are outside of each other
            var radiusSum = this.circle0.r + this.circle1.r;
            return Math.abs(dist - radiusSum);
        }
        else {
            // the circle with the smaller radius is inside the other circle
            if (this.circle0.r < this.circle1.r) {
                //circle0 inside circle1
                return Math.abs(this.circle1.r - (dist + this.circle0.r));
            }
            else {
                //circle1 inside circle0
                return Math.abs(this.circle0.r - (dist + this.circle1.r));
            }
        }
    };
    RelationTangentCircle.prototype.getVariables = function () {
        return this.variables;
    };
    RelationTangentCircle.prototype.containsFigure = function (figure) {
        if (figure instanceof point_1.default)
            return false;
        if (figure instanceof line_1.default)
            return false;
        return _super.prototype.containsFigure.call(this, figure);
    };
    return RelationTangentCircle;
}(relation_1.default));
exports.default = RelationTangentCircle;

},{"../geometry/line":5,"../geometry/point":6,"../geometry/util":7,"./relation":10}],17:[function(require,module,exports){
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
var point_1 = require("../geometry/point");
var util_1 = require("../geometry/util");
var RelationTangentLine = /** @class */ (function (_super) {
    __extends(RelationTangentLine, _super);
    function RelationTangentLine(line, circle) {
        var _this = _super.call(this, "tangent line") || this;
        _this.variables = [
            circle._r,
            circle.c._x,
            circle.c._y,
            line.p0._x,
            line.p0._y,
            line.p1._x,
            line.p1._y,
        ];
        _this.line = line;
        _this.circle = circle;
        return _this;
    }
    RelationTangentLine.prototype.getDeltas = function () {
        var deltas = [];
        var projection = util_1.default.projectOntoLine(this.line, this.circle.c);
        var projectionRadius = util_1.default.distanceBetweenPoints(this.circle.c, projection);
        var dr = projectionRadius - this.circle.r;
        deltas.push([this.circle._r, dr]);
        var dx = projection.x - this.circle.c.x;
        var dy = projection.y - this.circle.c.y;
        var da = new point_1.default(dx, dy);
        var normalized = util_1.default.normalize(da);
        var offset = new point_1.default(normalized.x * dr, normalized.y * dr);
        deltas.push([this.circle.c._x, offset.x]);
        deltas.push([this.circle.c._y, offset.y]);
        deltas.push([this.line.p0._x, -offset.x]);
        deltas.push([this.line.p0._y, -offset.y]);
        deltas.push([this.line.p1._x, -offset.x]);
        deltas.push([this.line.p1._y, -offset.y]);
        return deltas;
    };
    RelationTangentLine.prototype.getError = function () {
        var projection = util_1.default.projectOntoLine(this.line, this.circle.c);
        return util_1.default.distanceToCircle(this.circle, projection);
    };
    RelationTangentLine.prototype.getVariables = function () {
        return this.variables;
    };
    return RelationTangentLine;
}(relation_1.default));
exports.default = RelationTangentLine;

},{"../geometry/point":6,"../geometry/util":7,"./relation":10}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module gcs/sketch
 */
/** */
var point_1 = require("./geometry/point");
var manager_1 = require("./relations/manager");
var util_1 = require("./geometry/util");
var relationPointsOnCircle_1 = require("./relations/relationPointsOnCircle");
var arc_1 = require("./geometry/arc");
var Sketch = /** @class */ (function () {
    function Sketch() {
        this.figures = [];
        this.relationManager = new manager_1.default();
    }
    Sketch.prototype.getClosestFigure = function (point, scale, maxDist) {
        if (scale === void 0) { scale = 1; }
        if (maxDist === void 0) { maxDist = 10; }
        var allFigures = [];
        for (var _i = 0, _a = this.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            allFigures.push(fig);
            allFigures.push.apply(allFigures, fig.getChildFigures());
        }
        var closestDist = 0;
        var closest = null;
        for (var _b = 0, allFigures_1 = allFigures; _b < allFigures_1.length; _b++) {
            var fig = allFigures_1[_b];
            var p = fig.getClosestPoint(point);
            var dist = util_1.default.distanceBetweenPoints(p, point);
            if (fig instanceof point_1.default) {
                dist -= 5 / scale; // make it easier to be closest to a point
            }
            if (dist < closestDist || closest == null) {
                closest = fig;
                closestDist = dist;
            }
        }
        if (closestDist > maxDist / scale)
            return null;
        return closest;
    };
    Sketch.prototype.solveWithConstantFigures = function (figures, tireless) {
        if (tireless === void 0) { tireless = false; }
        for (var _i = 0, figures_1 = figures; _i < figures_1.length; _i++) {
            var fig = figures_1[_i];
            fig.constant = true;
        }
        this.relationManager.solveRelations(tireless);
        for (var _a = 0, figures_2 = figures; _a < figures_2.length; _a++) {
            var fig = figures_2[_a];
            fig.constant = false;
        }
        if (tireless && !this.relationManager.isSolved()) {
            alert("That state couldn't be solved...");
        }
    };
    Sketch.prototype.addFigure = function (figure) {
        if (this.figures.indexOf(figure) != -1)
            return;
        if (figure instanceof arc_1.default) {
            var relation = new relationPointsOnCircle_1.default(figure, figure.p0, figure.p1);
            this.relationManager.addRelations(relation);
        }
        this.figures.push(figure);
    };
    Sketch.prototype.addFigures = function () {
        var figures = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            figures[_i] = arguments[_i];
        }
        for (var _a = 0, figures_3 = figures; _a < figures_3.length; _a++) {
            var figure = figures_3[_a];
            this.addFigure(figure);
        }
    };
    return Sketch;
}());
exports.default = Sketch;

},{"./geometry/arc":2,"./geometry/point":6,"./geometry/util":7,"./relations/manager":9,"./relations/relationPointsOnCircle":15}],19:[function(require,module,exports){
"use strict";
/**
 * @module gcs/variable
 */
/** */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Value = /** @class */ (function () {
    function Value(v) {
        this.v = v;
        this.constant = false;
    }
    Object.defineProperty(Value.prototype, "v", {
        get: function () {
            return this._v;
        },
        set: function (v) {
            if (!this.constant)
                this._v = v;
        },
        enumerable: true,
        configurable: true
    });
    return Value;
}());
exports.Value = Value;
var Variable = /** @class */ (function () {
    function Variable(v) {
        this._links = [this];
        this._v = new Value(v);
        this._constant = false;
    }
    Object.defineProperty(Variable.prototype, "v", {
        get: function () {
            return this._v.v;
        },
        set: function (v) {
            if (!this._constant)
                this._v.v = v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Variable.prototype, "constant", {
        get: function () {
            return this._constant;
        },
        set: function (b) {
            this._constant = b;
            this._v.constant = b;
        },
        enumerable: true,
        configurable: true
    });
    Variable.prototype.linkValues = function (other) {
        // don't link twice!
        if (this._v === other._v)
            return;
        // link
        for (var _i = 0, _a = this._links; _i < _a.length; _i++) {
            var linked = _a[_i];
            // reminder: this._linked includes this
            linked._v = other._v;
        }
        // merge linked for this._linked and other._linked
        // this could be sped up by modify existing arrays instead of creating new ones
        // however, this is much more clear and this functionality is not used very often
        var merged = [];
        merged.push.apply(merged, this._links);
        merged.push.apply(merged, other._links);
        for (var _b = 0, merged_1 = merged; _b < merged_1.length; _b++) {
            var linked = merged_1[_b];
            // reminder: this._linked includes this
            linked._links = __spreadArrays(merged);
        }
    };
    Variable.prototype.unlink = function () {
        if (this._links.length == 1)
            return;
        for (var _i = 0, _a = this._links; _i < _a.length; _i++) {
            var linked = _a[_i];
            if (linked === this)
                continue;
            var index = linked._links.indexOf(this);
            linked._links.splice(index, 1);
        }
        this._v = new Value(this.v);
    };
    return Variable;
}());
exports.default = Variable;

},{}],20:[function(require,module,exports){
"use strict";
/**
 * @module main
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var protractr_1 = require("./protractr");
var canvas;
var topBar;
var sidePane;
var protractr;
var adjustCanvasResolution = function (event) {
    canvas.width = canvas.parentElement.clientWidth - 1;
    canvas.height = window.innerHeight - document.getElementsByClassName("title")[0].clientHeight - 5;
    protractr.ui.sketchView.draw();
};
window.addEventListener("resize", adjustCanvasResolution);
window.addEventListener("load", function () {
    canvas = document.getElementById("canvas");
    sidePane = document.getElementById("side-pane");
    topBar = document.getElementById("tools");
    protractr = new protractr_1.default(canvas, sidePane, topBar);
    adjustCanvasResolution(null);
    console.log("________                __                        __                   " + "\n" +
        "\\_____  \\_______  _____/  |_____________    _____/  |________        " + "\n" +
        "|    ___/\\_  __ \\/  _ \\   __\\_  __ \\__  \\ _/ ___\\   __\\_  __ \\" + "\n" +
        "|   |     |  | \\(  <_> )  |  |  | \\// __ \\\\  \\___|  |  |  | \\/   " + "\n" +
        "|___|     |__|   \\____/|__|  |__|  (____  /\\___  >__|  |__|          " + "\n" +
        "                                        \\/     \\/                                    ");
    console.log("Protractr: ", protractr);
    var example = document.location.search.substr(1);
    if (example.length > 0 && example.indexOf(".json") != -1) {
        console.log("Loading ", example);
        var path = document.location.pathname;
        var url = "examples/" + example;
        protractr.loadFromURL(url);
    }
});

},{"./protractr":21}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module protractr
 */
/** */
var sketch_1 = require("./gcs/sketch");
var ui_1 = require("./ui/ui");
var io_1 = require("./ui/io/io");
var Protractr = /** @class */ (function () {
    function Protractr(canvas, sidePane, topBar) {
        this.sketch = new sketch_1.default();
        this.ui = new ui_1.default(this, canvas, sidePane, topBar);
    }
    Protractr.prototype.setSketch = function (sketch) {
        this.sketch = sketch;
        this.ui.selectedFigures.clear();
        this.ui.boldFigures.clear();
        this.ui.selectedRelations.clear();
        this.ui.update();
    };
    Protractr.prototype.loadFromURL = function (url) {
        var request = new XMLHttpRequest();
        var _this = this;
        request.addEventListener("load", function () {
            if (this.status == 200) {
                _this.setSketch(io_1.default.DEFAULT_IMPORT.stringToSketch(this.responseText));
            }
            else {
                console.log("Failed to load sketch, response code != 200: ", this);
            }
        });
        request.open("GET", url);
        request.send();
    };
    return Protractr;
}());
exports.default = Protractr;

},{"./gcs/sketch":18,"./ui/io/io":30,"./ui/ui":45}],22:[function(require,module,exports){
"use strict";
/**
 * @module ui/actions
 * @preferred
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var Action = /** @class */ (function () {
    function Action(protractr) {
        this.protractr = protractr;
    }
    return Action;
}());
exports.default = Action;

},{}],23:[function(require,module,exports){
"use strict";
/**
 * @module ui/actions
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
var action_1 = require("./action");
var util_1 = require("../util");
var io_1 = require("../io/io");
var ActionExport = /** @class */ (function (_super) {
    __extends(ActionExport, _super);
    function ActionExport() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionExport.prototype.use = function () {
        util_1.saveAs(io_1.default.DEFAULT_EXPORT.sketchToString(this.protractr.sketch), io_1.default.DEFAULT_EXPORT.getFilename());
    };
    return ActionExport;
}(action_1.default));
exports.default = ActionExport;

},{"../io/io":30,"../util":46,"./action":22}],24:[function(require,module,exports){
"use strict";
/**
 * @module ui/actions
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
var action_1 = require("./action");
var io_1 = require("../io/io");
var ActionImport = /** @class */ (function (_super) {
    __extends(ActionImport, _super);
    function ActionImport() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionImport.prototype.use = function () {
        var input = prompt("JSON or URL to import");
        if (input[0] == "{") {
            this.protractr.setSketch(io_1.default.DEFAULT_IMPORT.stringToSketch(input));
        }
        else {
            this.protractr.loadFromURL(input);
        }
    };
    return ActionImport;
}(action_1.default));
exports.default = ActionImport;

},{"../io/io":30,"./action":22}],25:[function(require,module,exports){
"use strict";
/**
 * @module ui/actions
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
var action_1 = require("./action");
var util_1 = require("../util");
var io_1 = require("../io/io");
var ActionLatex = /** @class */ (function (_super) {
    __extends(ActionLatex, _super);
    function ActionLatex() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionLatex.prototype.use = function () {
        var latex = io_1.default.LATEX_EXPORT.sketchToString(this.protractr.sketch);
        navigator.clipboard.writeText(latex)
            .then(function () {
            alert("LaTeX copied to clipboard");
        })
            .catch(function () {
            util_1.saveAs(latex, io_1.default.LATEX_EXPORT.getFilename());
        });
    };
    return ActionLatex;
}(action_1.default));
exports.default = ActionLatex;

},{"../io/io":30,"../util":46,"./action":22}],26:[function(require,module,exports){
"use strict";
/**
 * @module ui/actions
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
var action_1 = require("./action");
var ActionRedo = /** @class */ (function (_super) {
    __extends(ActionRedo, _super);
    function ActionRedo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionRedo.prototype.use = function () {
        this.protractr.ui.restoreState(this.protractr.ui.history.redo());
    };
    return ActionRedo;
}(action_1.default));
exports.default = ActionRedo;

},{"./action":22}],27:[function(require,module,exports){
"use strict";
/**
 * @module ui/actions
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
var action_1 = require("./action");
var ActionUndo = /** @class */ (function (_super) {
    __extends(ActionUndo, _super);
    function ActionUndo() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionUndo.prototype.use = function () {
        this.protractr.ui.restoreState(this.protractr.ui.history.undo());
    };
    return ActionUndo;
}(action_1.default));
exports.default = ActionUndo;

},{"./action":22}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module ui/history
 */
/**
 * Editing history manager.  Consists of two stacks: undo and redo history.
 * New states clear redo history, are added to undo history.
 * It's possible for current state to be undefined, in which case the app should load some default state.
 */
var History = /** @class */ (function () {
    function History(startingState) {
        this.undoHistory = new HistoryStack();
        this.redoHistory = new HistoryStack();
        this.currentState = startingState;
    }
    /**
     * A new state produced by something other than undo or redo.
     */
    History.prototype.recordStateChange = function (newState) {
        if (this.currentState != newState) {
            this.undoHistory.push(this.currentState);
            this.redoHistory.clear();
            this.currentState = newState;
        }
    };
    /**
     * moves current state into redo, pops undo onto current state
     */
    History.prototype.undo = function () {
        if (this.undoHistory.empty())
            return this.currentState;
        this.redoHistory.push(this.currentState);
        this.currentState = this.undoHistory.pop();
        return this.currentState;
    };
    /**
     * moves current state into undo, pops redo onto current state
     */
    History.prototype.redo = function () {
        if (this.redoHistory.empty())
            return this.currentState;
        this.undoHistory.push(this.currentState);
        this.currentState = this.redoHistory.pop();
        return this.currentState;
    };
    return History;
}());
exports.default = History;
/**
 * Simple stack structure.  Adjacent elements must be distinct.
 */
var HistoryStack = /** @class */ (function () {
    function HistoryStack() {
        this.stack = [];
    }
    /**
     * Get top element of stack
     */
    HistoryStack.prototype.top = function () {
        if (this.empty())
            return undefined;
        return this.stack[this.stack.length - 1];
    };
    HistoryStack.prototype.push = function (element) {
        if (this.top() != element) {
            this.stack.push(element);
        }
    };
    /**
     * Get top element of stack and remove
     */
    HistoryStack.prototype.pop = function () {
        if (this.empty())
            return undefined;
        return this.stack.pop();
    };
    HistoryStack.prototype.empty = function () {
        return this.stack.length == 0;
    };
    HistoryStack.prototype.clear = function () {
        this.stack = [];
    };
    return HistoryStack;
}());

},{}],30:[function(require,module,exports){
"use strict";
/**
 * @module gcs/io
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var json_1 = require("./json");
var latex_1 = require("./latex");
var IO = /** @class */ (function () {
    function IO() {
    }
    // for history
    IO.HISTORY_IMPORT = new json_1.JSONImporter();
    IO.HISTORY_EXPORT = new json_1.JSONExporter();
    // for actions
    IO.DEFAULT_IMPORT = new json_1.JSONImporter();
    IO.DEFAULT_EXPORT = new json_1.JSONExporter();
    //latex
    IO.LATEX_EXPORT = new latex_1.LatexExporter();
    return IO;
}());
exports.default = IO;

},{"./json":31,"./latex":32}],31:[function(require,module,exports){
"use strict";
/**
 * @module gcs/io
 */
/** */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var sketch_1 = require("../../gcs/sketch");
var variable_1 = require("../../gcs/variable");
var point_1 = require("../../gcs/geometry/point");
var line_1 = require("../../gcs/geometry/line");
var circle_1 = require("../../gcs/geometry/circle");
var relationEqual_1 = require("../../gcs/relations/relationEqual");
var relationColinearPoints_1 = require("../../gcs/relations/relationColinearPoints");
var relationEqualLength_1 = require("../../gcs/relations/relationEqualLength");
var relationMidpoint_1 = require("../../gcs/relations/relationMidpoint");
var relationTangentCircle_1 = require("../../gcs/relations/relationTangentCircle");
var relationTangentLine_1 = require("../../gcs/relations/relationTangentLine");
var relationPointsOnCircle_1 = require("../../gcs/relations/relationPointsOnCircle");
var arc_1 = require("../../gcs/geometry/arc");
var JSONImporter = /** @class */ (function () {
    function JSONImporter() {
    }
    JSONImporter.prototype.stringToSketch = function (str) {
        var obj = JSON.parse(str);
        this.variables = [];
        for (var _i = 0, _a = obj.variables; _i < _a.length; _i++) {
            var v = _a[_i];
            this.variables.push(new variable_1.default(v));
        }
        this.points = [];
        for (var _b = 0, _c = obj.points; _b < _c.length; _b++) {
            var v = _c[_b];
            var point = new point_1.default(0, 0);
            point._x = this.variables[v[0]];
            point._y = this.variables[v[1]];
            point.label = v[2];
            point.labelPosition = v[3];
            this.points.push(point);
        }
        this.figures = [];
        for (var _d = 0, _e = obj.figures; _d < _e.length; _d++) {
            var f = _e[_d];
            this.figures.push(this.decodeF(f));
        }
        this.relations = [];
        for (var _f = 0, _g = obj.relations; _f < _g.length; _f++) {
            var r = _g[_f];
            this.relations.push(this.decodeR(r));
        }
        var sketch = new sketch_1.default();
        sketch.figures = this.figures;
        sketch.relationManager.relations = this.relations;
        return sketch;
    };
    JSONImporter.prototype.decodeF = function (obj) {
        if (obj.type == "point") {
            return this.points[obj.p];
        }
        else if (obj.type == "line") {
            var line = new line_1.default(new point_1.default(0, 0), new point_1.default(0, 0));
            line.p0 = this.points[obj.p0];
            line.p1 = this.points[obj.p1];
            return line;
        }
        else if (obj.type == "arc") {
            var arc = new arc_1.default(new point_1.default(0, 0), 0, 0, 0);
            arc.c = this.points[obj.c];
            arc._r = this.variables[obj.r];
            var p0 = new arc_1.ArcPoint(arc, 0, 0);
            p0._x = this.points[obj.p0]._x;
            p0._y = this.points[obj.p0]._y;
            this.points[obj.p0] = p0;
            arc.p0 = p0;
            var p1 = new arc_1.ArcPoint(arc, 0, 0);
            p1._x = this.points[obj.p1]._x;
            p1._y = this.points[obj.p1]._y;
            this.points[obj.p1] = p1;
            arc.p1 = p1;
            return arc;
        }
        else if (obj.type == "circle") {
            var circle = new circle_1.default(new point_1.default(0, 0), 0);
            circle.c = this.points[obj.c];
            circle._r = this.variables[obj.r];
            return circle;
        }
    };
    JSONImporter.prototype.decodeR = function (obj) {
        if (obj.type == "equal") {
            var variables = [];
            for (var _i = 0, _a = obj.variables; _i < _a.length; _i++) {
                var v = _a[_i];
                variables.push(this.variables[v]);
            }
            return new (relationEqual_1.default.bind.apply(relationEqual_1.default, __spreadArrays([void 0, obj.name], variables)))();
        }
        else if (obj.type == "colinear points") {
            var points = [];
            for (var _b = 0, _c = obj.points; _b < _c.length; _b++) {
                var p = _c[_b];
                points.push(this.points[p]);
            }
            return new (relationColinearPoints_1.default.bind.apply(relationColinearPoints_1.default, __spreadArrays([void 0], points)))();
        }
        else if (obj.type == "equal length") {
            var lines = [];
            for (var _d = 0, _e = obj.lines; _d < _e.length; _d++) {
                var l = _e[_d];
                lines.push(this.figures[l]);
            }
            return new (relationEqualLength_1.default.bind.apply(relationEqualLength_1.default, __spreadArrays([void 0], lines)))();
        }
        else if (obj.type == "midpoint") {
            var line = this.figures[obj.line];
            var midpoint = this.points[obj.midpoint];
            return new relationMidpoint_1.default(midpoint, line);
        }
        else if (obj.type == "points on circle") {
            var points = [];
            for (var _f = 0, _g = obj.points; _f < _g.length; _f++) {
                var p = _g[_f];
                points.push(this.points[p]);
            }
            var circle = this.figures[obj.circle];
            return new (relationPointsOnCircle_1.default.bind.apply(relationPointsOnCircle_1.default, __spreadArrays([void 0, circle], points)))();
        }
        else if (obj.type == "tangent circle") {
            var circle0 = this.figures[obj.circle0];
            var circle1 = this.figures[obj.circle1];
            return new relationTangentCircle_1.default(circle0, circle1);
        }
        else if (obj.type == "tangent line") {
            var circle = this.figures[obj.circle];
            var line = this.figures[obj.line];
            return new relationTangentLine_1.default(line, circle);
        }
    };
    return JSONImporter;
}());
exports.JSONImporter = JSONImporter;
var JSONExporter = /** @class */ (function () {
    function JSONExporter() {
    }
    JSONExporter.prototype.getFilename = function () {
        return "sketch.json";
    };
    JSONExporter.prototype.sketchToString = function (sketch) {
        var _a, _b;
        var obj = {
            variables: [],
            points: [],
            figures: [],
            relations: [] // relations made out of figures, points, and values
        };
        this.variables = [];
        this.figures = [];
        this.points = [];
        // save values
        for (var _i = 0, _c = sketch.figures; _i < _c.length; _i++) {
            var figure = _c[_i];
            (_a = this.variables).push.apply(_a, this.getFigureVariables(figure));
        }
        for (var _d = 0, _e = this.variables; _d < _e.length; _d++) {
            var variable = _e[_d];
            obj.variables.push(variable.v);
        }
        // save points
        for (var _f = 0, _g = sketch.figures; _f < _g.length; _f++) {
            var figure = _g[_f];
            (_b = this.points).push.apply(_b, this.getPoints(figure));
        }
        for (var _h = 0, _j = this.points; _h < _j.length; _h++) {
            var point = _j[_h];
            obj.points.push([this.encodeV(point._x), this.encodeV(point._y), point.label, point.labelPosition]);
        }
        // save figures
        this.figures = sketch.figures;
        for (var _k = 0, _l = this.figures; _k < _l.length; _k++) {
            var figure = _l[_k];
            obj.figures.push(this.encodeFigure(figure));
        }
        // save relations
        for (var _m = 0, _o = sketch.relationManager.relations; _m < _o.length; _m++) {
            var relation = _o[_m];
            obj.relations.push(this.encodeRelation(relation));
        }
        return JSON.stringify(obj);
    };
    JSONExporter.prototype.encodeRelation = function (relation) {
        if (relation instanceof relationEqual_1.default) {
            var variables = [];
            for (var _i = 0, _a = relation.variables; _i < _a.length; _i++) {
                var v = _a[_i];
                variables.push(this.encodeV(v));
            }
            return {
                type: "equal",
                name: relation.name,
                variables: variables,
            };
        }
        else if (relation instanceof relationColinearPoints_1.default) {
            var points = [];
            for (var _b = 0, _c = relation.points; _b < _c.length; _b++) {
                var p = _c[_b];
                points.push(this.encodeP(p));
            }
            return {
                type: "colinear points",
                points: points,
            };
        }
        else if (relation instanceof relationEqualLength_1.default) {
            var lines = [];
            for (var _d = 0, _e = relation.lines; _d < _e.length; _d++) {
                var l = _e[_d];
                lines.push(this.encodeF(l));
            }
            return {
                type: "equal length",
                lines: lines,
            };
        }
        else if (relation instanceof relationMidpoint_1.default) {
            return {
                type: "midpoint",
                line: this.encodeF(relation.line),
                midpoint: this.encodeP(relation.midpoint),
            };
        }
        else if (relation instanceof relationPointsOnCircle_1.default) {
            var points = [];
            for (var _f = 0, _g = relation.points; _f < _g.length; _f++) {
                var p = _g[_f];
                points.push(this.encodeP(p));
            }
            return {
                type: "points on circle",
                points: points,
                circle: this.encodeF(relation.circle),
            };
        }
        else if (relation instanceof relationTangentCircle_1.default) {
            return {
                type: "tangent circle",
                circle0: this.encodeF(relation.circle0),
                circle1: this.encodeF(relation.circle1),
            };
        }
        else if (relation instanceof relationTangentLine_1.default) {
            return {
                type: "tangent line",
                line: this.encodeF(relation.line),
                circle: this.encodeF(relation.circle),
            };
        }
    };
    JSONExporter.prototype.getPoints = function (figure) {
        if (figure instanceof point_1.default) {
            return [figure];
        }
        else if (figure instanceof line_1.default) {
            return [figure.p0, figure.p1];
        }
        else if (figure instanceof arc_1.default) {
            return [figure.c, figure.p0, figure.p1];
        }
        else if (figure instanceof circle_1.default) {
            return [figure.c];
        }
    };
    JSONExporter.prototype.encodeFigure = function (figure) {
        if (figure instanceof point_1.default) {
            var d = {
                type: "point",
                p: this.encodeP(figure)
            };
            if (figure.label && figure.labelPosition) {
                d["label"] = figure.label;
                d["labelPosition"] = figure.labelPosition;
            }
            return d;
        }
        else if (figure instanceof line_1.default) {
            return {
                type: "line",
                p0: this.encodeP(figure.p0),
                p1: this.encodeP(figure.p1),
            };
        }
        else if (figure instanceof arc_1.default) {
            return {
                type: "arc",
                c: this.encodeP(figure.c),
                r: this.encodeV(figure._r),
                p0: this.encodeP(figure.p0),
                p1: this.encodeP(figure.p1),
            };
        }
        else if (figure instanceof circle_1.default) {
            return {
                type: "circle",
                c: this.encodeP(figure.c),
                r: this.encodeV(figure._r),
            };
        }
    };
    JSONExporter.prototype.getFigureVariables = function (figure) {
        if (figure instanceof point_1.default) {
            return [figure._x, figure._y];
        }
        else if (figure instanceof line_1.default) {
            return [figure.p0._x, figure.p0._y, figure.p1._x, figure.p1._y];
        }
        else if (figure instanceof arc_1.default) {
            return [figure.c._x, figure.c._y, figure._r, figure.p0._x, figure.p0._y, figure.p1._x, figure.p1._y];
        }
        else if (figure instanceof circle_1.default) {
            return [figure.c._x, figure.c._y, figure._r];
        }
    };
    JSONExporter.prototype.encodeV = function (variable) {
        return this.variables.indexOf(variable);
    };
    JSONExporter.prototype.encodeF = function (figure) {
        return this.figures.indexOf(figure);
    };
    JSONExporter.prototype.encodeP = function (point) {
        return this.points.indexOf(point);
    };
    return JSONExporter;
}());
exports.JSONExporter = JSONExporter;

},{"../../gcs/geometry/arc":2,"../../gcs/geometry/circle":3,"../../gcs/geometry/line":5,"../../gcs/geometry/point":6,"../../gcs/relations/relationColinearPoints":11,"../../gcs/relations/relationEqual":12,"../../gcs/relations/relationEqualLength":13,"../../gcs/relations/relationMidpoint":14,"../../gcs/relations/relationPointsOnCircle":15,"../../gcs/relations/relationTangentCircle":16,"../../gcs/relations/relationTangentLine":17,"../../gcs/sketch":18,"../../gcs/variable":19}],32:[function(require,module,exports){
"use strict";
/**
 * @module gcs/io
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var point_1 = require("../../gcs/geometry/point");
var line_1 = require("../../gcs/geometry/line");
var arc_1 = require("../../gcs/geometry/arc");
var circle_1 = require("../../gcs/geometry/circle");
var LatexExporter = /** @class */ (function () {
    function LatexExporter() {
    }
    LatexExporter.prototype.getFilename = function () {
        return "sketch.tex";
    };
    LatexExporter.prototype.sketchToString = function (sketch) {
        var latex = "";
        var pointCount = 1;
        var opoints = [];
        var spoints = [];
        for (var _i = 0, _a = sketch.figures; _i < _a.length; _i++) {
            var figure = _a[_i];
            if (figure instanceof point_1.default) {
                opoints.push(figure);
            }
            else if (figure instanceof line_1.default) {
                opoints.push(figure.p0, figure.p1);
            }
            else if (figure instanceof arc_1.default) {
                opoints.push(figure.c, figure.p0, figure.p1);
            }
            else if (figure instanceof circle_1.default) {
                var c = figure.c;
                opoints.push(c);
                var r = figure.r;
                var top_1 = new point_1.default(c.x, c.y + r);
                var bot = new point_1.default(c.x, c.y - r);
                var left = new point_1.default(c.x + r, c.y);
                var right = new point_1.default(c.x - r, c.y);
                spoints.push(top_1, bot, left, right);
            }
        }
        if (opoints.length == 0)
            return "Nothing in sketch.";
        this.minX = opoints[0].x;
        this.minY = opoints[0].y;
        this.maxX = opoints[0].x;
        this.maxY = opoints[0].y;
        for (var _b = 0, opoints_1 = opoints; _b < opoints_1.length; _b++) {
            var point = opoints_1[_b];
            this.minX = Math.min(this.minX, point.x);
            this.minY = Math.min(this.minY, point.y);
            this.maxX = Math.max(this.maxX, point.x);
            this.maxY = Math.max(this.maxY, point.y);
        }
        // we determine size separately from offsets (includes extremes of circles)
        var tminX = this.minX;
        var tminY = this.minY;
        var tmaxX = this.maxX;
        var tmaxY = this.maxY;
        for (var _c = 0, spoints_1 = spoints; _c < spoints_1.length; _c++) {
            var point = spoints_1[_c];
            tminX = Math.min(tminX, point.x);
            tminY = Math.min(tminY, point.y);
            tmaxX = Math.max(tmaxX, point.x);
            tmaxY = Math.max(tmaxY, point.y);
        }
        var width = tmaxX - tminX;
        var height = tmaxY - tminY;
        this.scale = Math.min(450 / width, 800 / height, 1);
        for (var _d = 0, _e = sketch.figures; _d < _e.length; _d++) {
            var figure = _e[_d];
            if (figure instanceof point_1.default) {
                latex += this.lp(figure, pointCount++);
            }
            else if (figure instanceof line_1.default) {
                latex += this.lp(figure.p0, pointCount++);
                latex += this.lp(figure.p1, pointCount++);
                latex += "\t\\draw (P" + (pointCount - 2) + ") -- (P" + (pointCount - 1) + ");\n";
            }
            else if (figure instanceof arc_1.default) {
            }
            else if (figure instanceof circle_1.default) {
                latex += this.lp(figure.c, pointCount++);
                latex += "\t\\draw (P" + (pointCount - 1) + ") circle (" + figure.r * this.scale + ");\n";
            }
            latex += "\n";
        }
        return "\\begin{tikzpicture}[scale=0.035, black, line width=1pt, point/.style={circle, fill, inner sep=1.5pt}]\n"
            + latex
            + "\\end{tikzpicture}\n";
    };
    LatexExporter.prototype.lp = function (point, num) {
        var x = Math.round((point.x - this.minX) * this.scale);
        var y = Math.round((this.maxY - point.y) * this.scale);
        var latex = "\t\\node[point] at (" + x + ", " + y + ") (P" + num + ") {};\n";
        if (point.label && point.labelPosition) {
            if (point.labelPosition == "center") {
                latex = "\t\\node at (" + x + ", " + y + ") (P" + num + ") {" + point.label + "};\n";
            }
            else {
                latex += "\t\\node[" + point.labelPosition + "] at (P" + num + ") {" + point.label + "};\n";
            }
        }
        return latex;
    };
    return LatexExporter;
}());
exports.LatexExporter = LatexExporter;

},{"../../gcs/geometry/arc":2,"../../gcs/geometry/circle":3,"../../gcs/geometry/line":5,"../../gcs/geometry/point":6}],33:[function(require,module,exports){
"use strict";
/**
 * @module ui/menubar
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
var MenuBar = /** @class */ (function () {
    function MenuBar() {
        this.roundNext = true;
        this.lastAdded = null;
        this.div = document.createElement("div");
        this.div.classList.add("menu-bar");
    }
    MenuBar.prototype.addItem = function (item) {
        this.div.append(item.div);
        if (this.lastAdded) {
            this.lastAdded.div.style.borderBottomRightRadius = "0px";
            this.lastAdded.div.style.borderTopRightRadius = "0px";
        }
        if (this.roundNext) {
            item.div.style.borderBottomLeftRadius = "4px";
            item.div.style.borderTopLeftRadius = "4px";
            this.roundNext = false;
        }
        item.div.style.borderBottomRightRadius = "4px";
        item.div.style.borderTopRightRadius = "4px";
        this.lastAdded = item;
    };
    MenuBar.prototype.addDivider = function () {
        var divider = document.createElement("div");
        divider.classList.add("menu-divider");
        this.div.appendChild(divider);
        this.roundNext = true;
        this.lastAdded = null;
    };
    return MenuBar;
}());
exports.MenuBar = MenuBar;
var MenuItem = /** @class */ (function () {
    function MenuItem(tooltip, icon) {
        this.selected = false;
        this.div = document.createElement("div");
        this.div.classList.add("menu-item");
        this.div.title = tooltip;
        this.div.style.backgroundImage = "url('image/" + icon + "')";
        this.div.addEventListener("click", this.click.bind(this));
    }
    MenuItem.prototype.setSelected = function (selected) {
        if (selected) {
            this.div.classList.add("selected");
        }
        else {
            this.div.classList.remove("selected");
        }
        this.selected = selected;
    };
    return MenuItem;
}());
exports.MenuItem = MenuItem;
var ActionMenuItem = /** @class */ (function (_super) {
    __extends(ActionMenuItem, _super);
    function ActionMenuItem(action, tooltip, icon) {
        var _this = _super.call(this, tooltip, icon) || this;
        _this.action = action;
        return _this;
    }
    ActionMenuItem.prototype.click = function () {
        this.action.use();
    };
    return ActionMenuItem;
}(MenuItem));
exports.ActionMenuItem = ActionMenuItem;
var ToolMenuItem = /** @class */ (function (_super) {
    __extends(ToolMenuItem, _super);
    function ToolMenuItem(toolGroup, tool, tooltip, icon) {
        var _this = _super.call(this, tooltip, icon) || this;
        _this.toolGroup = toolGroup;
        _this.tool = tool;
        _this.toolGroup.addTool(_this);
        return _this;
    }
    ToolMenuItem.prototype.click = function () {
        this.toolGroup.selectTool(this);
    };
    return ToolMenuItem;
}(MenuItem));
exports.ToolMenuItem = ToolMenuItem;
var ToolGroup = /** @class */ (function () {
    function ToolGroup() {
        this.selectedTool = null;
        this.toolMenuItems = [];
    }
    ToolGroup.prototype.addTool = function (toolMenuItem) {
        this.toolMenuItems.push(toolMenuItem);
        if (this.selectedTool == null)
            this.selectTool(toolMenuItem);
    };
    ToolGroup.prototype.selectTool = function (toolMenuItem) {
        this.selectedTool = toolMenuItem.tool;
        for (var _i = 0, _a = this.toolMenuItems; _i < _a.length; _i++) {
            var tool = _a[_i];
            tool.setSelected(tool == toolMenuItem);
        }
    };
    return ToolGroup;
}());
exports.ToolGroup = ToolGroup;

},{}],34:[function(require,module,exports){
"use strict";
/**
 * @module ui/sketchview
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var point_1 = require("../gcs/geometry/point");
var line_1 = require("../gcs/geometry/line");
var circle_1 = require("../gcs/geometry/circle");
var arc_1 = require("../gcs/geometry/arc");
var SketchView = /** @class */ (function () {
    function SketchView(ui, canvas) {
        this.lastPanPoint = null;
        this.ui = ui;
        this.canvas = canvas;
        this.ctxScale = 1;
        this.ctxOrigin = new point_1.default(0, 0);
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
        var s = this.ctxScale - (deltaY * 0.005 * this.ctxScale);
        this.ctxScale = Math.min(10, Math.max(0.1, s));
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
                this.ui.topBar.activeTool.down(point);
                break;
            case "mousemove":
                this.ui.topBar.activeTool.move(point);
                break;
            case "mouseup":
                this.ui.topBar.activeTool.up(point);
                break;
        }
    };
    SketchView.prototype.handleMouseEvent = function (event) {
        event.preventDefault();
        var offset = new point_1.default(event.offsetX, event.offsetY);
        var scaled = new point_1.default(offset.x / this.ctxScale, offset.y / this.ctxScale);
        var point = new point_1.default(scaled.x - this.ctxOrigin.x / this.ctxScale, scaled.y - this.ctxOrigin.y / this.ctxScale);
        this.updateHover(point);
        if (event.type == "wheel") {
            var delta = event.deltaY;
            //convert delta into pixels...
            if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
                delta *= 16; // just a guess--depends on inaccessible user settings
            }
            else if (event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
                delta *= 800; // also just a guess--no good way to predict these...
            }
            this.handleZoomEvent(delta, point);
        }
        if (event.which == 2 || (event.type == "mousemove" && this.lastPanPoint != null)) {
            this.handlePanEvent(event.type, offset);
        }
        if (event.which == 1 || event.type == "mousemove") {
            this.handleToolEvent(event.type, point);
        }
        this.draw();
    };
    SketchView.prototype.updateHover = function (point) {
        var closest;
        closest = this.ui.protractr.sketch.getClosestFigure(point, this.ctxScale, 10);
        this.hoveredFigure = closest;
        if (this.hoveredFigure != null) {
            this.setCursor("move");
        }
        else {
            this.setCursor("default");
        }
    };
    SketchView.prototype.setCursor = function (cursor) {
        this.canvas.style.cursor = cursor;
    };
    SketchView.prototype.drawFigure = function (fig) {
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2 / this.ctxScale;
        var pointSize = 3;
        if (this.ui.selectedFigures.contains(fig)) {
            this.ctx.strokeStyle = "#5e9cff";
        }
        if (this.hoveredFigure == fig || this.ui.boldFigures.contains(fig)) {
            pointSize = 7;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        if (this.ui.selectedRelations.elements.some(function (r) { return r.containsFigure(fig); })) {
            this.ctx.strokeStyle = "purple";
            pointSize = 7;
            this.ctx.lineWidth = 5 / this.ctxScale;
        }
        if (fig instanceof point_1.default) {
            this.drawPoint(fig, pointSize, this.ctx.strokeStyle);
        }
        else if (fig instanceof line_1.default) {
            this.drawLine(fig.p0, fig.p1);
        }
        else if (fig instanceof arc_1.default) {
            this.drawArc(fig.c, fig.r, fig.angle0, fig.angle1);
        }
        else if (fig instanceof circle_1.default) {
            this.drawCircle(fig.c, fig.r);
        }
    };
    SketchView.prototype.draw = function () {
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.translate(this.ctxOrigin.x, this.ctxOrigin.y);
        this.ctx.scale(this.ctxScale, this.ctxScale);
        for (var _i = 0, _a = this.ui.protractr.sketch.figures; _i < _a.length; _i++) {
            var fig = _a[_i];
            this.drawFigure(fig);
            for (var _b = 0, _c = fig.getChildFigures(); _b < _c.length; _b++) {
                var child = _c[_b];
                this.drawFigure(child);
            }
        }
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2 / this.ctxScale;
        this.ui.topBar.activeTool.draw(this);
    };
    SketchView.prototype.drawPoint = function (point, size, color) {
        if (size === void 0) { size = 3; }
        if (color === void 0) { color = "black"; }
        if (!point)
            return;
        this.ctx.fillStyle = color;
        if (point.label && point.labelPosition == "center") {
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.font = 20 / this.ctxScale + "px serif";
            this.ctx.fillText(point.label, point.x, point.y);
        }
        else {
            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);
            this.ctx.arc(point.x, point.y, size / this.ctxScale, 0, Math.PI * 2);
            this.ctx.fill();
            if (point.label && point.labelPosition) {
                this.ctx.font = 20 / this.ctxScale + "px serif";
                switch (point.labelPosition) {
                    case "below":
                        this.ctx.textAlign = "center";
                        this.ctx.textBaseline = "top";
                        this.ctx.fillText(point.label, point.x, point.y + 3 / this.ctxScale);
                        break;
                    case "above":
                        this.ctx.textAlign = "center";
                        this.ctx.textBaseline = "bottom";
                        this.ctx.fillText(point.label, point.x, point.y - 3 / this.ctxScale);
                        break;
                    case "left":
                        this.ctx.textAlign = "right";
                        this.ctx.textBaseline = "middle";
                        this.ctx.fillText(point.label, point.x - 10 / this.ctxScale, point.y);
                        break;
                    case "right":
                        this.ctx.textAlign = "left";
                        this.ctx.textBaseline = "middle";
                        this.ctx.fillText(point.label, point.x + 10 / this.ctxScale, point.y);
                        break;
                }
            }
        }
    };
    SketchView.prototype.drawLine = function (p1, p2) {
        if (!p1 || !p2)
            return;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
    };
    SketchView.prototype.drawCircle = function (center, radius) {
        if (!center)
            return;
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    };
    SketchView.prototype.drawArc = function (center, radius, a0, a1) {
        if (!center)
            return;
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, a0, a1);
        this.ctx.stroke();
    };
    return SketchView;
}());
exports.default = SketchView;

},{"../gcs/geometry/arc":2,"../gcs/geometry/circle":3,"../gcs/geometry/line":5,"../gcs/geometry/point":6}],35:[function(require,module,exports){
"use strict";
/**
 * @module ui/tools
 * @preferred
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var Tool = /** @class */ (function () {
    function Tool(protractr) {
        this.protractr = protractr;
        this.reset();
    }
    Tool.prototype.getFigureNearPoint = function (point) {
        return this.protractr.sketch.getClosestFigure(point, this.protractr.ui.sketchView.ctxScale, 10);
    };
    return Tool;
}());
exports.default = Tool;

},{}],36:[function(require,module,exports){
"use strict";
/**
 * @module ui/tools
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
var toolCreateFigure_1 = require("./toolCreateFigure");
var util_1 = require("../../gcs/geometry/util");
var arc_1 = require("../../gcs/geometry/arc");
var ToolCreateArc = /** @class */ (function (_super) {
    __extends(ToolCreateArc, _super);
    function ToolCreateArc(protractr) {
        return _super.call(this, protractr, 3) || this;
    }
    ToolCreateArc.prototype.addFigure = function () {
        var center = this.points[0].point;
        var radius = util_1.default.distanceBetweenPoints(center, this.points[1].point);
        var a0 = util_1.default.getAngleBetween(center, this.points[1].point);
        var a1 = util_1.default.getAngleBetween(center, this.points[2].point);
        var arc = new arc_1.default(center, radius, a0, a1);
        this.addRelationsBySnap(arc.c, this.points[0].snapFigure);
        this.addRelationsBySnap(arc.p0, this.points[1].snapFigure);
        this.addRelationsBySnap(arc.p1, this.points[2].snapFigure);
        this.protractr.sketch.addFigure(arc);
    };
    ToolCreateArc.prototype.draw = function (sketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
        else if (this.points.length == 2) {
            var center = this.points[0].point;
            sketchView.drawPoint(center);
            var radius = util_1.default.distanceBetweenPoints(center, this.currentPoint.point);
            sketchView.drawCircle(center, radius);
            sketchView.drawPoint(this.currentPoint.point);
        }
        else {
            var center = this.points[0].point;
            var p0 = this.points[1].point;
            var radius = util_1.default.distanceBetweenPoints(center, p0);
            var p1 = util_1.default.pointInDirection(center, this.currentPoint.point, radius);
            sketchView.drawPoint(center);
            sketchView.drawPoint(p0);
            sketchView.drawPoint(p1);
            var a0 = util_1.default.getAngleBetween(center, p0);
            var a1 = util_1.default.getAngleBetween(center, p1);
            sketchView.drawArc(center, radius, a0, a1);
        }
    };
    return ToolCreateArc;
}(toolCreateFigure_1.default));
exports.default = ToolCreateArc;

},{"../../gcs/geometry/arc":2,"../../gcs/geometry/util":7,"./toolCreateFigure":38}],37:[function(require,module,exports){
"use strict";
/**
 * @module ui/tools
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
var toolCreateFigure_1 = require("./toolCreateFigure");
var circle_1 = require("../../gcs/geometry/circle");
var util_1 = require("../../gcs/geometry/util");
var ToolCreateCircle = /** @class */ (function (_super) {
    __extends(ToolCreateCircle, _super);
    function ToolCreateCircle(protractr) {
        return _super.call(this, protractr, 2) || this;
    }
    ToolCreateCircle.prototype.addFigure = function () {
        var center = this.points[0].point;
        var radius = util_1.default.distanceBetweenPoints(center, this.points[1].point);
        var circle = new circle_1.default(center, radius);
        this.addRelationsBySnap(circle.c, this.points[0].snapFigure);
        this.addRelationsBySnap(circle, this.points[1].snapFigure);
        this.protractr.sketch.addFigure(circle);
    };
    ToolCreateCircle.prototype.draw = function (sketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
        else {
            var center = this.points[0].point;
            sketchView.drawPoint(center);
            var radius = util_1.default.distanceBetweenPoints(center, this.currentPoint.point);
            sketchView.drawCircle(center, radius);
        }
    };
    return ToolCreateCircle;
}(toolCreateFigure_1.default));
exports.default = ToolCreateCircle;

},{"../../gcs/geometry/circle":3,"../../gcs/geometry/util":7,"./toolCreateFigure":38}],38:[function(require,module,exports){
"use strict";
/**
 * @module ui/tools
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
var tool_1 = require("./tool");
var point_1 = require("../../gcs/geometry/point");
var circle_1 = require("../../gcs/geometry/circle");
var line_1 = require("../../gcs/geometry/line");
var relationEqual_1 = require("../../gcs/relations/relationEqual");
var relationPointsOnCircle_1 = require("../../gcs/relations/relationPointsOnCircle");
var relationColinearPoints_1 = require("../../gcs/relations/relationColinearPoints");
var ToolCreateFigure = /** @class */ (function (_super) {
    __extends(ToolCreateFigure, _super);
    function ToolCreateFigure(protractr, pointsPerFigure) {
        var _this = _super.call(this, protractr) || this;
        _this.pointsPerFigure = pointsPerFigure;
        return _this;
    }
    ToolCreateFigure.prototype.down = function (point) {
        //do nothing
    };
    ToolCreateFigure.prototype.up = function (point) {
        if (this.points.length >= this.pointsPerFigure) {
            this.addFigure();
            this.protractr.ui.update();
            this.protractr.ui.pushState();
            this.points = [];
        }
        this.currentPoint = { point: null, snapFigure: null };
        this.points.push(this.currentPoint);
        this.updateFigureCreationPoint(this.currentPoint, point);
    };
    ToolCreateFigure.prototype.move = function (point) {
        this.updateFigureCreationPoint(this.currentPoint, point);
    };
    ToolCreateFigure.prototype.reset = function () {
        this.currentPoint = { point: null, snapFigure: null };
        this.points = [this.currentPoint];
    };
    ToolCreateFigure.prototype.updateFigureCreationPoint = function (figureCreationPoint, newPoint) {
        figureCreationPoint.snapFigure = this.getFigureNearPoint(newPoint);
        if (figureCreationPoint.snapFigure) {
            figureCreationPoint.point = figureCreationPoint.snapFigure.getClosestPoint(newPoint);
        }
        else {
            figureCreationPoint.point = newPoint.copy();
        }
    };
    ToolCreateFigure.prototype.addRelationsBySnap = function (figure, snapFigure) {
        if (!snapFigure)
            return;
        if (figure instanceof point_1.default) {
            if (snapFigure instanceof point_1.default) {
                var ex = new relationEqual_1.default("vertical", figure._x, snapFigure._x);
                var ey = new relationEqual_1.default("horizontal", figure._y, snapFigure._y);
                this.protractr.sketch.relationManager.addRelations(ex, ey);
            }
            else if (snapFigure instanceof circle_1.default) {
                this.protractr.sketch.relationManager.addRelations(new relationPointsOnCircle_1.default(snapFigure, figure));
            }
            else if (snapFigure instanceof line_1.default) {
                this.protractr.sketch.relationManager.addRelations(new relationColinearPoints_1.default(snapFigure.p0, snapFigure.p1, figure));
                // TODO midpoint
            }
        }
        else if (figure instanceof circle_1.default) {
            if (snapFigure instanceof point_1.default) {
                this.protractr.sketch.relationManager.addRelations(new relationPointsOnCircle_1.default(figure, snapFigure));
            }
        }
    };
    return ToolCreateFigure;
}(tool_1.default));
exports.default = ToolCreateFigure;

},{"../../gcs/geometry/circle":3,"../../gcs/geometry/line":5,"../../gcs/geometry/point":6,"../../gcs/relations/relationColinearPoints":11,"../../gcs/relations/relationEqual":12,"../../gcs/relations/relationPointsOnCircle":15,"./tool":35}],39:[function(require,module,exports){
"use strict";
/**
 * @module ui/tools
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
var toolCreateFigure_1 = require("./toolCreateFigure");
var line_1 = require("../../gcs/geometry/line");
var ToolCreateLine = /** @class */ (function (_super) {
    __extends(ToolCreateLine, _super);
    function ToolCreateLine(protractr) {
        return _super.call(this, protractr, 2) || this;
    }
    ToolCreateLine.prototype.addFigure = function () {
        var line = new line_1.default(this.points[0].point, this.points[1].point);
        this.addRelationsBySnap(line.p0, this.points[0].snapFigure);
        this.addRelationsBySnap(line.p1, this.points[1].snapFigure);
        this.protractr.sketch.addFigure(line);
    };
    ToolCreateLine.prototype.draw = function (sketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
        else {
            var p0 = this.points[0].point;
            var p1 = this.points[1].point;
            sketchView.drawPoint(p0);
            sketchView.drawPoint(p1);
            sketchView.drawLine(p0, p1);
        }
    };
    return ToolCreateLine;
}(toolCreateFigure_1.default));
exports.default = ToolCreateLine;

},{"../../gcs/geometry/line":5,"./toolCreateFigure":38}],40:[function(require,module,exports){
"use strict";
/**
 * @module ui/tools
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
var toolCreateFigure_1 = require("./toolCreateFigure");
var ToolCreatePoint = /** @class */ (function (_super) {
    __extends(ToolCreatePoint, _super);
    function ToolCreatePoint(protractr) {
        return _super.call(this, protractr, 1) || this;
    }
    ToolCreatePoint.prototype.addFigure = function () {
        var point = this.points[0].point.copy();
        this.addRelationsBySnap(point, this.points[0].snapFigure);
        this.protractr.sketch.addFigure(point);
    };
    ToolCreatePoint.prototype.draw = function (sketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
    };
    return ToolCreatePoint;
}(toolCreateFigure_1.default));
exports.default = ToolCreatePoint;

},{"./toolCreateFigure":38}],41:[function(require,module,exports){
"use strict";
/**
 * @module ui/tools
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
var toolCreateFigure_1 = require("./toolCreateFigure");
var point_1 = require("../../gcs/geometry/point");
var line_1 = require("../../gcs/geometry/line");
var relationEqual_1 = require("../../gcs/relations/relationEqual");
var ToolCreateRect = /** @class */ (function (_super) {
    __extends(ToolCreateRect, _super);
    function ToolCreateRect(protractr) {
        return _super.call(this, protractr, 2) || this;
    }
    ToolCreateRect.prototype.addFigure = function () {
        var p0 = this.points[0].point;
        var p2 = this.points[1].point;
        var p1 = new point_1.default(p2.x, p0.y);
        var p3 = new point_1.default(p0.x, p2.y);
        var h0 = new line_1.default(p0, p1);
        var v0 = new line_1.default(p1, p2);
        var h1 = new line_1.default(p2, p3);
        var v1 = new line_1.default(p3, p0);
        var hc0 = new relationEqual_1.default("horizontal", h0.p0._y, h0.p1._y, v0.p0._y, v1.p1._y);
        var hc1 = new relationEqual_1.default("horizontal", h1.p0._y, h1.p1._y, v0.p1._y, v1.p0._y);
        var vc0 = new relationEqual_1.default("vertical", v0.p0._x, v0.p1._x, h0.p1._x, h1.p0._x);
        var vc1 = new relationEqual_1.default("vertical", v1.p0._x, v1.p1._x, h0.p0._x, h1.p1._x);
        this.protractr.sketch.relationManager.addRelations(hc0, hc1, vc0, vc1);
        this.addRelationsBySnap(h0.p0, this.points[0].snapFigure);
        this.addRelationsBySnap(v1.p1, this.points[0].snapFigure);
        this.addRelationsBySnap(h1.p0, this.points[1].snapFigure);
        this.addRelationsBySnap(v0.p1, this.points[1].snapFigure);
        this.protractr.sketch.addFigures(h0, h1, v0, v1);
    };
    ToolCreateRect.prototype.draw = function (sketchView) {
        if (this.points.length == 1) {
            sketchView.drawPoint(this.currentPoint.point);
        }
        else {
            var p0 = this.points[0].point;
            var p2 = this.points[1].point;
            var p1 = new point_1.default(p2.x, p0.y);
            var p3 = new point_1.default(p0.x, p2.y);
            sketchView.drawPoint(p0);
            sketchView.drawPoint(p1);
            sketchView.drawPoint(p2);
            sketchView.drawPoint(p3);
            sketchView.drawLine(p0, p1);
            sketchView.drawLine(p1, p2);
            sketchView.drawLine(p2, p3);
            sketchView.drawLine(p3, p0);
        }
    };
    return ToolCreateRect;
}(toolCreateFigure_1.default));
exports.default = ToolCreateRect;

},{"../../gcs/geometry/line":5,"../../gcs/geometry/point":6,"../../gcs/relations/relationEqual":12,"./toolCreateFigure":38}],42:[function(require,module,exports){
"use strict";
/**
 * @module ui/tools
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
var toolSelect_1 = require("./toolSelect");
var filterString_1 = require("../../gcs/filterString");
var ToolFilterSelect = /** @class */ (function (_super) {
    __extends(ToolFilterSelect, _super);
    function ToolFilterSelect(protractr, filterString) {
        var _this = _super.call(this, protractr) || this;
        _this.filter = new filterString_1.default(filterString);
        return _this;
    }
    ToolFilterSelect.prototype.figureShouldBeSelected = function (figure) {
        return this.filter.satisfiesFilter([figure]) && _super.prototype.figureShouldBeSelected.call(this, figure);
    };
    return ToolFilterSelect;
}(toolSelect_1.default));
exports.default = ToolFilterSelect;

},{"../../gcs/filterString":1,"./toolSelect":43}],43:[function(require,module,exports){
"use strict";
/**
 * @module ui/tools
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
var tool_1 = require("./tool");
var point_1 = require("../../gcs/geometry/point");
var util_1 = require("../../gcs/geometry/util");
var line_1 = require("../../gcs/geometry/line");
var circle_1 = require("../../gcs/geometry/circle");
var ToolSelect = /** @class */ (function (_super) {
    __extends(ToolSelect, _super);
    function ToolSelect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ToolSelect.prototype.down = function (point) {
        this.pressed = true;
        this.downFigure = this.getFigureNearPoint(point);
        if (!this.downFigure) {
            this.protractr.ui.selectedFigures.clear();
            this.selectionStart = point;
            this.selectionEnd = point;
        }
        else {
            this.lastDrag = point.copy();
        }
    };
    ToolSelect.prototype.up = function (point) {
        if (this.downFigure) {
            this.protractr.sketch.solveWithConstantFigures([this.downFigure], true);
            this.protractr.ui.pushState();
            this.protractr.ui.update();
        }
        if (!this.dragging && this.downFigure) {
            this.protractr.ui.selectedFigures.togglePresence(this.downFigure);
        }
        this.reset();
    };
    ToolSelect.prototype.move = function (point) {
        var _a;
        if (this.pressed)
            this.dragging = true;
        if (this.downFigure && this.dragging) {
            this.downFigure.translate(this.lastDrag, point.copy());
            this.protractr.sketch.solveWithConstantFigures([this.downFigure]);
            this.lastDrag = point.copy();
            this.protractr.ui.update();
        }
        else {
            this.selectionEnd = point;
            if (this.selectionStart) {
                var selection = [];
                for (var _i = 0, _b = this.protractr.sketch.figures; _i < _b.length; _i++) {
                    var figure = _b[_i];
                    if (this.figureShouldBeSelected(figure)) {
                        selection.push(figure);
                    }
                    for (var _c = 0, _d = figure.getChildFigures(); _c < _d.length; _c++) {
                        var relatedFigure = _d[_c];
                        if (this.figureShouldBeSelected(relatedFigure)) {
                            selection.push(relatedFigure);
                        }
                    }
                }
                (_a = this.protractr.ui.selectedFigures).set.apply(_a, selection);
            }
        }
    };
    ToolSelect.prototype.draw = function (sketchView) {
        if (!this.selectionStart || !this.selectionEnd)
            return;
        var w = this.selectionEnd.x - this.selectionStart.x;
        var h = this.selectionEnd.y - this.selectionStart.y;
        sketchView.ctx.fillStyle = "green";
        sketchView.ctx.globalAlpha = 0.5;
        sketchView.ctx.fillRect(this.selectionStart.x, this.selectionStart.y, w, h);
        sketchView.ctx.globalAlpha = 1;
        sketchView.ctx.strokeStyle = "green";
        sketchView.ctx.strokeRect(this.selectionStart.x, this.selectionStart.y, w, h);
    };
    ToolSelect.prototype.reset = function () {
        this.selectionEnd = null;
        this.selectionStart = null;
        this.dragging = false;
        this.pressed = false;
    };
    ToolSelect.prototype.figureInRectangle = function (figure) {
        if (figure instanceof point_1.default) {
            return util_1.default.pointWithinRectangle(this.selectionStart, this.selectionEnd, figure);
        }
        var p0 = this.selectionStart;
        var p1 = new point_1.default(this.selectionStart.x, this.selectionEnd.y);
        var p2 = this.selectionEnd;
        var p3 = new point_1.default(this.selectionEnd.x, this.selectionStart.y);
        var l0 = new line_1.default(p0, p1);
        var l1 = new line_1.default(p1, p2);
        var l2 = new line_1.default(p2, p3);
        var l3 = new line_1.default(p3, p0);
        if (figure instanceof line_1.default) {
            if (this.figureInRectangle(figure.p0) || this.figureInRectangle(figure.p1)) {
                return true;
            }
            //test if line intersects any of the edges
            if (util_1.default.segmentsIntersect(l0, figure))
                return true;
            if (util_1.default.segmentsIntersect(l1, figure))
                return true;
            if (util_1.default.segmentsIntersect(l2, figure))
                return true;
            if (util_1.default.segmentsIntersect(l3, figure))
                return true;
            return false;
        }
        else if (figure instanceof circle_1.default) {
            var p0In = util_1.default.pointWithinCircle(figure, p0);
            var p1In = util_1.default.pointWithinCircle(figure, p1);
            var p2In = util_1.default.pointWithinCircle(figure, p2);
            var p3In = util_1.default.pointWithinCircle(figure, p3);
            var allInside = p0In && p1In && p2In && p3In;
            if (allInside)
                return false;
            var allOutside = !p0In && !p1In && !p2In && !p3In;
            if (!allOutside)
                return true;
            // shortcut!
            if (this.figureInRectangle(figure.c))
                return true;
            // technically, because the rectangle is axis-bounded, we could just check 4 points on the circle
            // but this is more intuitive
            if (util_1.default.lineIntersectsCircle(figure, l0))
                return true;
            if (util_1.default.lineIntersectsCircle(figure, l1))
                return true;
            if (util_1.default.lineIntersectsCircle(figure, l2))
                return true;
            if (util_1.default.lineIntersectsCircle(figure, l3))
                return true;
            return false;
        }
        return false;
    };
    ToolSelect.prototype.figureShouldBeSelected = function (figure) {
        return this.figureInRectangle(figure);
    };
    return ToolSelect;
}(tool_1.default));
exports.default = ToolSelect;

},{"../../gcs/geometry/circle":3,"../../gcs/geometry/line":5,"../../gcs/geometry/point":6,"../../gcs/geometry/util":7,"./tool":35}],44:[function(require,module,exports){
"use strict";
/**
 * @module ui/topbar
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var menubar_1 = require("./menubar");
var toolSelect_1 = require("./tools/toolSelect");
var toolFilterSelect_1 = require("./tools/toolFilterSelect");
var toolCreatePoint_1 = require("./tools/toolCreatePoint");
var toolCreateLine_1 = require("./tools/toolCreateLine");
var toolCreateCircle_1 = require("./tools/toolCreateCircle");
var toolCreateRect_1 = require("./tools/toolCreateRect");
var actionUndo_1 = require("./actions/actionUndo");
var actionRedo_1 = require("./actions/actionRedo");
var actionImport_1 = require("./actions/actionImport");
var actionExport_1 = require("./actions/actionExport");
var toolCreateArc_1 = require("./tools/toolCreateArc");
var actionLatex_1 = require("./actions/actionLatex");
var TopBar = /** @class */ (function () {
    function TopBar(protractr, topBarElement) {
        this.menuBar = new menubar_1.MenuBar();
        this.toolGroup = new menubar_1.ToolGroup();
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolSelect_1.default(protractr), "Select and move figures", "drag.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolFilterSelect_1.default(protractr, ":*point"), "Select and move points", "filter-point.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolFilterSelect_1.default(protractr, ":*line"), "Select and move lines", "filter-line.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolFilterSelect_1.default(protractr, ":*circle"), "Select and move circles", "filter-circle.png"));
        this.menuBar.addDivider();
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolCreatePoint_1.default(protractr), "Create a point", "point.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolCreateLine_1.default(protractr), "Create a line", "line.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolCreateRect_1.default(protractr), "Create a rectangle", "rect.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolCreateCircle_1.default(protractr), "Create a circle", "circle.png"));
        this.menuBar.addItem(new menubar_1.ToolMenuItem(this.toolGroup, new toolCreateArc_1.default(protractr), "Create an arc", "arc.png"));
        this.menuBar.addDivider();
        this.menuBar.addItem(new menubar_1.ActionMenuItem(new actionUndo_1.default(protractr), "Undo an action", "undo.png"));
        this.menuBar.addItem(new menubar_1.ActionMenuItem(new actionRedo_1.default(protractr), "Redo an action", "redo.png"));
        this.menuBar.addDivider();
        this.menuBar.addItem(new menubar_1.ActionMenuItem(new actionImport_1.default(protractr), "Import a sketch", "import.png"));
        this.menuBar.addItem(new menubar_1.ActionMenuItem(new actionExport_1.default(protractr), "Export a sketch", "export.png"));
        this.menuBar.addItem(new menubar_1.ActionMenuItem(new actionLatex_1.default(protractr), "Export to LaTeX", "latex.png"));
        topBarElement.appendChild(this.menuBar.div);
    }
    Object.defineProperty(TopBar.prototype, "activeTool", {
        get: function () {
            return this.toolGroup.selectedTool;
        },
        enumerable: true,
        configurable: true
    });
    return TopBar;
}());
exports.default = TopBar;

},{"./actions/actionExport":23,"./actions/actionImport":24,"./actions/actionLatex":25,"./actions/actionRedo":26,"./actions/actionUndo":27,"./menubar":33,"./tools/toolCreateArc":36,"./tools/toolCreateCircle":37,"./tools/toolCreateLine":39,"./tools/toolCreatePoint":40,"./tools/toolCreateRect":41,"./tools/toolFilterSelect":42,"./tools/toolSelect":43}],45:[function(require,module,exports){
"use strict";
/**
 * @module ui
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var sidePanel_1 = require("./widgets/sidePanel");
var sketchview_1 = require("./sketchview");
var history_1 = require("./history");
var topbar_1 = require("./topbar");
var container_1 = require("./container");
var io_1 = require("./io/io");
var UI = /** @class */ (function () {
    function UI(protractr, canvas, sidePane, topBar) {
        this.protractr = protractr;
        this.history = new history_1.default(io_1.default.HISTORY_EXPORT.sketchToString(protractr.sketch));
        this.sketchView = new sketchview_1.default(this, canvas);
        this.sidePanel = new sidePanel_1.default(this, sidePane);
        this.topBar = new topbar_1.default(protractr, topBar);
        this.selectedFigures = new container_1.default([], this.update.bind(this));
        this.boldFigures = new container_1.default([], this.update.bind(this));
        this.selectedRelations = new container_1.default([], this.update.bind(this));
        this.update();
    }
    UI.prototype.pushState = function () {
        var e = io_1.default.HISTORY_EXPORT.sketchToString(this.protractr.sketch);
        this.history.recordStateChange(e);
    };
    UI.prototype.restoreState = function (state) {
        this.protractr.setSketch(io_1.default.DEFAULT_IMPORT.stringToSketch(state));
    };
    UI.prototype.update = function () {
        this.sidePanel.update();
        this.sketchView.draw();
    };
    return UI;
}());
exports.default = UI;

},{"./container":28,"./history":29,"./io/io":30,"./sketchview":34,"./topbar":44,"./widgets/sidePanel":52}],46:[function(require,module,exports){
"use strict";
/**
 * @module ui/util
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
function saveAs(string, filename) {
    var a = document.createElement("a");
    var data = "text/json;charset=utf-8," + encodeURIComponent(string);
    a.href = "data:" + data;
    a.download = filename;
    a.click();
}
exports.saveAs = saveAs;

},{}],47:[function(require,module,exports){
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

},{"./titledWidget":53,"./widget":54}],48:[function(require,module,exports){
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

},{"../../gcs/relations/creator":8,"./titledWidget":53}],49:[function(require,module,exports){
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

},{"./listWidget":47}],50:[function(require,module,exports){
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
var listWidget_1 = require("./listWidget");
var filterString_1 = require("../../gcs/filterString");
var SelectedFigureListWidget = /** @class */ (function (_super) {
    __extends(SelectedFigureListWidget, _super);
    function SelectedFigureListWidget() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectedFigureListWidget.prototype.update = function () {
        var figures = this.ui.selectedFigures.elements;
        if (figures.length == 0) {
            this.setVisible(false);
        }
        else if (figures.length == 1) {
            this.setVisible(true);
            this.setTitle("Selected Figure:");
        }
        else {
            this.setVisible(true);
            this.setTitle("Selected Figures:");
        }
        this.setItems(figures);
    };
    SelectedFigureListWidget.prototype.getElementFromItem = function (item) {
        return new SelectedFigureElement(this.ui, item, filterString_1.getFigureTypeString(item), "delete.png", "Remove from selection");
    };
    return SelectedFigureListWidget;
}(listWidget_1.default));
exports.default = SelectedFigureListWidget;
var SelectedFigureElement = /** @class */ (function (_super) {
    __extends(SelectedFigureElement, _super);
    function SelectedFigureElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectedFigureElement.prototype.actionIconClicked = function (event) {
        this.ui.selectedFigures.remove(this.value);
        this.ui.boldFigures.remove(this.value);
        this.ui.update();
        event.stopPropagation();
        return false;
    };
    SelectedFigureElement.prototype.onmousedown = function (event) {
        this.ui.selectedFigures.set(this.value);
        this.ui.update();
    };
    SelectedFigureElement.prototype.onmouseenter = function (event) {
        this.ui.boldFigures.add(this.value);
        this.ui.update();
    };
    SelectedFigureElement.prototype.onmouseleave = function (event) {
        this.ui.boldFigures.remove(this.value);
        this.ui.update();
    };
    return SelectedFigureElement;
}(listWidget_1.ListElement));

},{"../../gcs/filterString":1,"./listWidget":47}],51:[function(require,module,exports){
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

},{"../../gcs/geometry/circle":3,"../../gcs/geometry/line":5,"../../gcs/geometry/point":6,"./widget":54}],52:[function(require,module,exports){
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
var widget_1 = require("./widget");
var selectedFigureWidget_1 = require("./selectedFigureWidget");
var newRelationsWidget_1 = require("./newRelationsWidget");
var relationListWidget_1 = require("./relationListWidget");
var selectedFigureListWidget_1 = require("./selectedFigureListWidget");
var SidePanel = /** @class */ (function (_super) {
    __extends(SidePanel, _super);
    function SidePanel(ui, sidePane) {
        var _this = _super.call(this, ui, sidePane) || this;
        _this.addWidget(new selectedFigureListWidget_1.default(ui));
        _this.addWidget(new selectedFigureWidget_1.default(ui));
        _this.addWidget(new newRelationsWidget_1.default(ui));
        _this.addWidget(new relationListWidget_1.default(ui));
        return _this;
    }
    return SidePanel;
}(widget_1.default));
exports.default = SidePanel;

},{"./newRelationsWidget":48,"./relationListWidget":49,"./selectedFigureListWidget":50,"./selectedFigureWidget":51,"./widget":54}],53:[function(require,module,exports){
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
var TitledWidget = /** @class */ (function (_super) {
    __extends(TitledWidget, _super);
    function TitledWidget(ui) {
        var _this = _super.call(this, ui) || this;
        _this.title = document.createElement("p");
        _this.div.appendChild(_this.title);
        return _this;
    }
    TitledWidget.prototype.setTitle = function (title) {
        this.title.innerText = title;
    };
    return TitledWidget;
}(widget_1.default));
exports.default = TitledWidget;

},{"./widget":54}],54:[function(require,module,exports){
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

},{}]},{},[20]);
