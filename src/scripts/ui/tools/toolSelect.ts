/**
 * @module ui/tools
 */
/** */

import Tool from "./tool";
import Point from "../../gcs/geometry/point";
import Figure from "../../gcs/geometry/figure";
import SketchView from "../sketchview";
import Util from "../../gcs/geometry/util";
import Line from "../../gcs/geometry/line";
import Circle from "../../gcs/geometry/circle";
import circle from "../../gcs/geometry/circle";

export default class ToolSelect extends Tool {
    selectionStart: Point;
    selectionEnd: Point;
    dragging: boolean;
    pressed: boolean;
    downFigure: Figure;
    lastDrag: Point;

    down(point: Point) {
        this.pressed = true;
        this.downFigure = this.getFigureNearPoint(point);
        if (!this.downFigure) {
            this.protractr.ui.infoPane.selectedFiguresList.clear();
            this.selectionStart = point;
            this.selectionEnd = point;
        } else {
            this.lastDrag = point.copy();
        }
    }

    up(point: Point) {
        if (this.downFigure) {
            this.protractr.sketch.solveWithConstantFigures([this.downFigure], true);
            this.protractr.ui.pushState();
        }
        if (!this.dragging && this.downFigure) {
            let list = this.protractr.ui.infoPane.selectedFiguresList;
            if (list.figureSelected(this.downFigure)) {
                list.removeFigure(this.downFigure);
            } else {
                list.addFigure(this.downFigure);
            }
        }
        this.reset();
    }

    move(point: Point) {
        if (this.pressed) this.dragging = true;
        if (this.downFigure && this.dragging) {
            this.downFigure.translate(this.lastDrag, point.copy());
            this.protractr.sketch.solveWithConstantFigures([this.downFigure]);
            this.lastDrag = point.copy();
        } else {
            this.selectionEnd = point;
            if (this.selectionStart) {
                let selection = [];
                for(let figure of this.protractr.sketch.figures) {
                    if (this.figureShouldBeSelected(figure)) {
                        selection.push(figure);
                    }
                    for(let relatedFigure of figure.getChildFigures()) {
                        if (this.figureShouldBeSelected(relatedFigure)) {
                            selection.push(relatedFigure);
                        }
                    }
                }
                this.protractr.ui.infoPane.selectedFiguresList.setFigures(selection);
            }
        }
    }

    draw(sketchView: SketchView) {
        if (!this.selectionStart || !this.selectionEnd) return;
        let w = this.selectionEnd.x - this.selectionStart.x;
        let h = this.selectionEnd.y - this.selectionStart.y;
        sketchView.ctx.fillStyle = "green";
        sketchView.ctx.globalAlpha = 0.5;
        sketchView.ctx.fillRect(this.selectionStart.x, this.selectionStart.y, w, h);
        sketchView.ctx.globalAlpha = 1;
        sketchView.ctx.strokeStyle = "green";
        sketchView.ctx.strokeRect(this.selectionStart.x, this.selectionStart.y, w, h);
    }

    reset() {
        this.selectionEnd = null;
        this.selectionStart = null;
        this.dragging = false;
        this.pressed = false;
    }

    getFigureNearPoint(point: Point): Figure {
        return this.protractr.sketch.getClosestFigure(point);
    }

    figureInRectangle(figure: Figure): boolean {
        if (figure instanceof Point) {
            return Util.pointWithinRectangle(this.selectionStart, this.selectionEnd, figure);
        }

        let p0 = this.selectionStart;
        let p1 = new Point(this.selectionStart.x, this.selectionEnd.y);
        let p2 = this.selectionEnd;
        let p3 = new Point(this.selectionEnd.x, this.selectionStart.y);

        let l0 = new Line(p0, p1);
        let l1 = new Line(p1, p2);
        let l2 = new Line(p2, p3);
        let l3 = new Line(p3, p0);

        if (figure instanceof Line) {
            if (this.figureInRectangle(figure.p0) || this.figureInRectangle(figure.p1)) {
                return true;
            }
            //test if line intersects any of the edges
            if(Util.segmentsIntersect(l0, figure)) return true;
            if(Util.segmentsIntersect(l1, figure)) return true;
            if(Util.segmentsIntersect(l2, figure)) return true;
            if(Util.segmentsIntersect(l3, figure)) return true;
            return false;
        } else if (figure instanceof Circle) {
            let p0In = Util.pointWithinCircle(figure, p0);
            let p1In = Util.pointWithinCircle(figure, p1);
            let p2In = Util.pointWithinCircle(figure, p2);
            let p3In = Util.pointWithinCircle(figure, p3);

            let allInside = p0In && p1In && p2In && p3In;
            if (allInside) return false;

            let allOutside = !p0In && !p1In && !p2In && !p3In;
            if (!allOutside) return true;

            // shortcut!
            if (this.figureInRectangle(figure.c)) return true;

            if (Util.lineIntersectsCircle(figure, l0)) return true;
            if (Util.lineIntersectsCircle(figure, l1)) return true;
            if (Util.lineIntersectsCircle(figure, l2)) return true;
            if (Util.lineIntersectsCircle(figure, l3)) return true;

            return false;
        }
        return false;
    }

    figureShouldBeSelected(figure: Figure): boolean {
        return this.figureInRectangle(figure);
    }
}