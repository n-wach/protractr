import {CircleFigure, Figure, LineFigure, PointFigure} from "../gcs/figures";
import {protractr} from "../main";

export class Tool {
    name: string;
    tooltip: string;
    li: HTMLLIElement;
    imageUrl: string;
    currentFigure: Figure;
    constructor(name: string, tooltip: string) {
        this.name = name;
        this.tooltip = tooltip;
        this.imageUrl = "../image/" + name.toLowerCase() + ".png";
    }
    activate() {
        this.li.classList.add("tool-active");
    }
    deactivate() {
        this.li.classList.remove("tool-active");
    }
    down(point) {

    }
    up(point) {

    }
    move(point) {

    }
}

export class PointTool extends Tool {
    constructor() {
        super("Point", "Create a point");
    }
    down(point) {
        this.currentFigure = new PointFigure(point);
        this.currentFigure.selected = true;
        protractr.figures.push(this.currentFigure);
    }
    up(point) {
        if(this.currentFigure) {
            this.currentFigure.selected = false;
            this.currentFigure = null;
        }
    }
    move(point) {
        if(this.currentFigure) {
            (this.currentFigure as PointFigure).p.set(point);
        }
    }
}

export class LineTool extends Tool {
    constructor() {
        super("Line", "Create a line");
    }
    down(point) {
        this.up(point);
        this.currentFigure = new LineFigure(new PointFigure(point), new PointFigure(point.copy()));
        this.currentFigure.selected = true;
        (this.currentFigure as LineFigure).p2.selected = true;
        protractr.figures.push(this.currentFigure);
    }
    up(point) {
        if(this.currentFigure) {
            (this.currentFigure as LineFigure).p2.selected = false;
            this.currentFigure.selected = false;
            this.currentFigure = null;
        }
    }
    move(point) {
        if(this.currentFigure) {
            (this.currentFigure as LineFigure).p2.p.set(point);
        }
    }
}


export class CircleTool extends Tool {
    currentFigure: CircleFigure;
    constructor() {
        super("Circle", "Create a circle");
    }
    down(point) {
        this.up(point);
        this.currentFigure = new CircleFigure(new PointFigure(point), point.copy());
        this.currentFigure.selected = true;
        protractr.figures.push(this.currentFigure);
    }
    up(point) {
        if(this.currentFigure) {
            this.currentFigure.selected = false;
            this.currentFigure = null;
        }
    }
    move(point) {
        if(this.currentFigure) {
            this.currentFigure.r = point.distTo(this.currentFigure.c.p);
        }
    }
}



