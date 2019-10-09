import {ctx} from "../main";

export class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    set(p: Point) {
        this.x = p.x;
        this.y = p.y;
    }
    copy() {
        return new Point(this.x, this.y);
    }
    distTo(o: Point) {
        let dx = o.x - this.x;
        let dy = o.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}


export class PointFigure implements Figure {
    p: Point;
    selected: boolean;
    constructor(p: Point) {
        this.p = p;
    }
    draw() {
        ctx.fillStyle = this.selected ? "red" : "black";
        ctx.beginPath();
        ctx.arc(this.p.x, this.p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    getSnappablePoints(): Point[] {
        return [this.p];
    }
}

export class LineFigure implements Figure {
    selected: boolean;
    p1: PointFigure;
    p2: PointFigure;
    constructor(p1: PointFigure, p2: PointFigure) {
        this.p1 = p1;
        this.p2 = p2;
    }
    draw() {
        ctx.strokeStyle = this.selected ? "red" : "black";
        ctx.beginPath();
        ctx.moveTo(this.p1.p.x, this.p1.p.y);
        ctx.lineTo(this.p2.p.x, this.p2.p.y);
        ctx.stroke();
        ctx.closePath();
        this.p1.draw();
        this.p2.draw();
    }
    getSnappablePoints(): Point[] {
        return [this.p1.p, this.p2.p];
    }
}

export class CircleFigure implements Figure {
    selected: boolean;
    c: PointFigure;
    r: number;
    constructor(c: PointFigure, r: number) {
        this.c = c;
        this.r = r;
    }
    draw() {
        ctx.strokeStyle = this.selected ? "red" : "black";
        ctx.beginPath();
        ctx.arc(this.c.p.x, this.c.p.y, this.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        this.c.draw();
    }
    getSnappablePoints(): Point[] {
        return [this.c.p];
    }
}


export interface Figure {
    selected: boolean;
    draw();

    getSnappablePoints(): Point[];
}