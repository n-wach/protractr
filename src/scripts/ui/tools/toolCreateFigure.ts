/**
 * @module ui/tools
 */
/** */

import Tool from "./tool";
import Figure from "../../gcs/geometry/figure";
import Point from "../../gcs/geometry/point";
import Circle from "../../gcs/geometry/circle";
import Line from "../../gcs/geometry/line";
import RelationEqual from "../../gcs/relations/relationEqual";
import RelationPointsOnCircle from "../../gcs/relations/relationPointsOnCircle";
import RelationColinearPoints from "../../gcs/relations/relationColinearPoints";

type FigureCreationPoint = { point: Point, snapFigure: Figure };

export default abstract class ToolCreateFigure extends Tool {
    points: FigureCreationPoint[];
    currentPoint: FigureCreationPoint;
    pointsPerFigure: number;

    protected constructor(protractr, pointsPerFigure: number) {
        super(protractr);
        this.pointsPerFigure = pointsPerFigure;
    }

    down(point: Point) {
        //do nothing
    }

    up(point: Point) {
        if (this.points.length >= this.pointsPerFigure) {
            this.addFigure();
            this.protractr.ui.refresh();
            this.protractr.ui.pushState();
            this.points = [];
        }
        this.currentPoint = {point: null, snapFigure: null};
        this.points.push(this.currentPoint);
        this.updateFigureCreationPoint(this.currentPoint, point);
    }

    move(point: Point) {
        this.updateFigureCreationPoint(this.currentPoint, point);
    }

    reset() {
        this.currentPoint = {point: null, snapFigure: null};
        this.points = [this.currentPoint];
    }

    updateFigureCreationPoint(figureCreationPoint: FigureCreationPoint, newPoint: Point) {
        figureCreationPoint.snapFigure = this.protractr.sketch.getClosestFigure(newPoint);
        if (figureCreationPoint.snapFigure) {
            figureCreationPoint.point = figureCreationPoint.snapFigure.getClosestPoint(newPoint);
        } else {
            figureCreationPoint.point = newPoint.copy();
        }
    }

    addRelationsBySnap(figure: Figure, snapFigure: Figure) {
        if (!snapFigure) return;
        if (figure instanceof Point) {
            if (snapFigure instanceof Point) {
                let ex = new RelationEqual(figure._x, snapFigure._x);
                let ey = new RelationEqual(figure._y, snapFigure._y);
                this.protractr.sketch.relationManager.addRelations(ex, ey);
            } else if (snapFigure instanceof Circle) {
                this.protractr.sketch.relationManager.addRelations(new RelationPointsOnCircle(snapFigure, figure));
            } else if (snapFigure instanceof Line) {
                this.protractr.sketch.relationManager.addRelations(new RelationColinearPoints(snapFigure.p0, snapFigure.p1, figure));
                // TODO midpoint
            }
        } else if (figure instanceof Circle) {
            if (snapFigure instanceof Point) {
                this.protractr.sketch.relationManager.addRelations(new RelationPointsOnCircle(figure, snapFigure));
            }
        }
    }

    abstract addFigure();
}