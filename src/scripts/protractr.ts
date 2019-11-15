import {Sketch} from "./gcs/sketch";
import {UI} from "./ui/ui";
import {protractr} from "./main";

export class Protractr {
    sketch: Sketch;
    ui: UI;
    constructor(canvas: HTMLCanvasElement, sidePane: HTMLDivElement, toolbar: HTMLUListElement) {
        this.sketch = new Sketch();
        this.ui = new UI(this, canvas, sidePane, toolbar);
        this.ui.sketchView.pushState();
    }
    loadSketch(json) {
        this.sketch = Sketch.fromObject(JSON.parse(json));
        this.ui.sketchView.draw();
        this.ui.infoPane.updateConstraintList(this.sketch.constraints);
    }
    exportSketch() {
        return JSON.stringify(this.sketch.asObject());
    }
    resetSketch() {
        this.sketch = new Sketch();
        this.ui.sketchView.draw();
        this.ui.infoPane.updateConstraintList(this.sketch.constraints);
    }
}

