/**
 * @module gcs/io
 */
/** */

import {Exporter} from "./io";
import Sketch from "../../gcs/sketch";
import Point from "../../gcs/geometry/point";
import Line from "../../gcs/geometry/line";
import Arc from "../../gcs/geometry/arc";
import Circle from "../../gcs/geometry/circle";
import {JSONExporter} from "./json";
import Figure from "../../gcs/geometry/figure";

export class LatexExporter implements Exporter {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    scale: number;
    getFilename(): string {
        return "sketch.tex";
    }

    sketchToString(sketch: Sketch): string {
        let latex = "";
        let pointCount = 1;
        let opoints = [];
        let spoints = [];

        for(let figure of sketch.figures) {
            if(figure instanceof Point) {
                opoints.push(figure);
            } else if (figure instanceof Line) {
                opoints.push(figure.p0, figure.p1);
            } else if (figure instanceof Arc) {
                opoints.push(figure.c, figure.p0, figure.p1);
            } else if (figure instanceof Circle) {
                let c = figure.c;
                opoints.push(c);
                let r = figure.r;
                let top = new Point(c.x, c.y + r);
                let bot = new Point(c.x, c.y - r);
                let left = new Point(c.x + r, c.y);
                let right = new Point(c.x - r, c.y);
                spoints.push(top, bot, left, right);
            }
        }

        if(opoints.length == 0) return "Nothing in sketch.";

        this.minX = opoints[0].x;
        this.minY = opoints[0].y;
        this.maxX = opoints[0].x;
        this.maxY = opoints[0].y;

        for(let point of opoints) {
            this.minX = Math.min(this.minX, point.x);
            this.minY = Math.min(this.minY, point.y);
            this.maxX = Math.max(this.maxX, point.x);
            this.maxY = Math.max(this.maxY, point.y);
        }

        // we determine size separately from offsets (includes extremes of circles)
        let tminX = this.minX;
        let tminY = this.minY;
        let tmaxX = this.maxX;
        let tmaxY = this.maxY;

        for(let point of spoints) {
            tminX = Math.min(tminX, point.x);
            tminY = Math.min(tminY, point.y);
            tmaxX = Math.max(tmaxX, point.x);
            tmaxY = Math.max(tmaxY, point.y);
        }

        let width = tmaxX - tminX;
        let height = tmaxY - tminY;
        this.scale = Math.min(450 / width, 800 / height, 1);

        for(let figure of sketch.figures) {
            if(figure instanceof Point) {
                latex += `\t\\node[point] at ${this.ePnt(figure)} (P${pointCount++}) {};\n`;
            } else if (figure instanceof Line) {
                latex += `\t\\node[point] at ${this.ePnt(figure.p0)} (P${pointCount++}) {};\n`;
                latex += `\t\\node[point] at ${this.ePnt(figure.p1)} (P${pointCount++}) {};\n`;
                latex += `\t\\draw (P${pointCount - 2}) -- (P${pointCount - 1});\n`;
            } else if (figure instanceof Arc) {

            } else if (figure instanceof Circle) {
                latex += `\t\\node[point] at ${this.ePnt(figure.c)} (P${pointCount++}) {};\n`;
                latex += `\t\\draw (P${pointCount - 1}) circle (${figure.r * this.scale});\n`;
            }
            latex += "\n";
        }

        return "\\begin{tikzpicture}[scale=0.035, black, line width=1pt, point/.style={circle, fill, inner sep=1.5pt}]\n"
            + latex
            + "\\end{tikzpicture}\n";
    }

    ePnt(point: Point) {
        let x = Math.round((point.x - this.minX) * this.scale);
        let y = Math.round((this.maxY - point.y) * this.scale);
        return `(${x}, ${y})`;
    }
}