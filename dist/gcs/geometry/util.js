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
//# sourceMappingURL=util.js.map