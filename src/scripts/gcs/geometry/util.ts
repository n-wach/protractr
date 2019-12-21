/**
 * @module gcs/geometry
 */
/** */
import Line from "./line";
import Point from "./point";
import Circle from "./circle";

export default class Util {

    /**
     * Returns the average point
     * returns `new Point(avgX, avgY)`
     * @param points
     */
    static averageOfPoints(...points: Point[]) {
        let x = 0;
        let y = 0;
        for(let point of points) {
            x += point.x;
            y += point.y;
        }
        return new Point(x / points.length, y / points.length);
    }

    /**
     * Returns the length of the line
     * @param line
     */
    static lengthOfLine(line: Line): number {
        return Util.distanceBetween(line.p0, line.p1);
    }

    /**
     * Return the distance between p0 and p1
     * @param p0
     * @param p1
     */
    static distanceBetween(p0: Point, p1: Point): number {
        let dx = p0.x - p1.x;
        let dy = p0.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     *
     * @param point
     */
    static magnitudeOfPoint(point: Point) {
        let x = point.x;
        let y = point.y;
        return Math.sqrt(x * x + y * y);
    }

    /**
     * Return a new point with the magnitude 1, pointing in the same direction
     * If the point has no magnitude, returns `new Point(0, 1)`
     * @param point
     */
    static normalize(point: Point): Point {
        let mag = Util.magnitudeOfPoint(point);
        if (mag == 0) {
            return new Point(0, 1);
        }
        return new Point(point.x / mag, point.y / mag);
    }

    /**
     * Projects point onto circle.
     * If point in center of circle, returns top of circle.
     * @param point
     * @param circle
     */
    static projectOntoCircle(point: Point, circle: Circle) {
        let r = circle.r;
        // ray represents the direction from the center of the circle to the point
        let ray = new Point(circle.c.x - point.x, circle.c.y - point.y);
        // now we set the magnitude of the ray to the radius
        let normalized = Util.normalize(ray);
        normalized.x *= r;
        normalized.y *= r;
        // then we translate the point back relative to the center of the circle
        return new Point(normalized.x + circle.c.x, normalized.y + circle.c.y);
    }

    /**
     * Project point onto line. Point may not be on the line, but it will be co-linear.
     * @param point
     * @param line
     */
    static projectOntoLine(point: Point, line: Line): Point {
        let r = Util.projectionFactorBetween(point, line);
        return Util.pointAlongLine(r, line);
    }

    /**
     * Project point onto line, but make sure the point remains on the line
     * @param point
     * @param line
     */
    static projectSegment(point: Point, line: Line): Point {
        let r = Util.projectionFactorBetween(point, line);
        if (r < 0) r = 0;
        else if (r > 1 || isNaN(r)) r = 1;
        return Util.pointAlongLine(r, line);
    }

    /**
     * Return a point co-lienar with line, with a position determined by r.
     * r = 0: line.p0
     * r = 1: line.p1
     * Numbers outside of [0, 1] are valid.
     * @param r
     * @param line
     */
    static pointAlongLine(r: number, line: Line): Point {
        let px = line.p0.x + r * (line.p1.x - line.p0.x);
        let py = line.p0.y + r * (line.p1.y - line.p0.y);
        return new Point(px, py);
    }

    /**
     * Returns fraction of projection along line
     * 0 is line.p0, 1 is line.p1
     * @param point
     * @param line
     */
    static projectionFactorBetween(point: Point, line: Line): number {
        if (line.p0.equals(point)) return 0;
        if (line.p1.equals(point)) return 1;
        let dx = line.p0.x - line.p1.x;
        let dy = line.p0.y - line.p1.y;
        let len2 = dx * dx + dy * dy;
        return -((point.x - line.p0.x) * dx + (point.y - line.p0.y) * dy) / len2;
    }

    /**
     * Determine if three points are clockwise (1), counterclockwise(-1) or colinear(0)
     * @param p0
     * @param p1
     * @param p2
     */
    static orientation(p0: Point, p1: Point, p2: Point): number {
        let val = (p1.y - p0.y) * (p2.x - p1.x) -
            (p1.x - p0.x) * (p2.y - p1.y);

        if (Math.abs(val) < 0.1) return 0;  // colinear

        return (val > 0) ? 1 : -1; // clock or counterclock wise
    }

    /**
     * Given that point is co-linear to line, return if it lies on the line
     * @param point
     * @param line
     */
    static onSegment(point: Point, line: Line): boolean {
        return line.p0.x <= Math.max(point.x, line.p1.x) &&
               line.p0.x >= Math.min(point.x, line.p1.x) &&
               line.p0.y <= Math.max(point.y, line.p1.y) &&
               line.p0.y >= Math.min(point.y, line.p1.y);
    }

    /**
     * Returns true if line0 intersects line1
     * @param line0
     * @param line1
     */
    static segmentsIntersect(line0: Line, line1: Line) {
        let o0 = Util.orientation(line0.p0, line0.p1, line1.p0);
        let o1 = Util.orientation(line0.p0, line0.p1, line1.p1);
        let o2 = Util.orientation(line1.p0, line1.p1, line0.p0);
        let o3 = Util.orientation(line1.p0, line1.p1, line0.p1);

        //General case
        if (o0 != o1 && o2 != o3) return true;

        // Special Cases
        if (o0 == 0 && Util.onSegment(line1.p0, line0)) return true;
        if (o1 == 0 && Util.onSegment(line1.p1, line0)) return true;
        if (o2 == 0 && Util.onSegment(line0.p0, line1)) return true;
        if (o3 == 0 && Util.onSegment(line0.p1, line1)) return true;

        return false;
    }
}