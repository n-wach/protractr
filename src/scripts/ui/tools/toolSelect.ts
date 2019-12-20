import Tool from "./tool";
import {CircleFigure, Figure, LineFigure, Point, PointFigure} from "../../gcs/figures";
import {SketchView} from "../sketchview";
import {protractr} from "../../main";

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
            this.downFigure.setLocked(true);
            this.lastDrag = point.copy();
        }
    }

    up(point: Point) {
        if (this.downFigure) {
            this.protractr.sketch.solveConstraints();
            this.downFigure.setLocked(false);
            this.protractr.sketch.solveConstraints(true);
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
            this.downFigure.setLocked(false);
            this.downFigure.translate(this.lastDrag, point.copy());
            this.downFigure.setLocked(true);
            this.protractr.sketch.solveConstraints();
            this.lastDrag = point.copy();
        } else {
            this.selectionEnd = point;
            if (this.selectionStart) {
                let selection = [];
                for(let figure of protractr.sketch.rootFigures) {
                    for(let relatedFigure of figure.getRelatedFigures()) {
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
        if (figure.type == "point") {
            let p = (figure as PointFigure).p;
            return (
                (this.selectionStart.x > p.x && this.selectionEnd.x < p.x) ||
                (this.selectionStart.x < p.x && this.selectionEnd.x > p.x)
            ) && (
                (this.selectionStart.y > p.y && this.selectionEnd.y < p.y) ||
                (this.selectionStart.y < p.y && this.selectionEnd.y > p.y)
            );
        }

        let p1 = this.selectionStart;
        let p2 = new Point(this.selectionStart.x, this.selectionEnd.y);
        let p3 = this.selectionEnd;
        let p4 = new Point(this.selectionEnd.x, this.selectionStart.y);

        if (figure.type == "line") {
            let line = (figure as LineFigure);
            if (this.figureInRectangle(line.childFigures[0]) || this.figureInRectangle(line.childFigures[1])) {
                return true;
            }
            //test if line intersects any of the edges
            if (Point.doIntersect(p1, p2, line.p1, line.p2)) return true;
            if (Point.doIntersect(p2, p3, line.p1, line.p2)) return true;
            if (Point.doIntersect(p3, p4, line.p1, line.p2)) return true;
            if (Point.doIntersect(p4, p1, line.p1, line.p2)) return true;
            return false;
        } else if (figure.type == "circle") {
            let circle = (figure as CircleFigure);
            let center = circle.c;
            let radius = circle.r.value;

            let p1In = center.distTo(p1) < radius;
            let p2In = center.distTo(p2) < radius;
            let p3In = center.distTo(p3) < radius;
            let p4In = center.distTo(p4) < radius;

            let allInside = p1In && p2In && p3In && p4In;
            if (allInside) return false;

            let allOutside = !p1In && !p2In && !p3In && !p4In;
            if (!allOutside) return true;

            if (this.figureInRectangle(circle.childFigures[0])) return true;

            if (Point.distToLine(p1, p2, center, true) < radius) return true;
            if (Point.distToLine(p2, p3, center, true) < radius) return true;
            if (Point.distToLine(p3, p4, center, true) < radius) return true;
            if (Point.distToLine(p4, p1, center, true) < radius) return true;

            return false;
        }
        return false;
    }

    figureShouldBeSelected(figure: Figure): boolean {
        return this.figureInRectangle(figure);
    }
}