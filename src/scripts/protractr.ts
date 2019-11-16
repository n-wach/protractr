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
    loadSketch(json: string, push: boolean=true) {
        this.sketch = Sketch.fromObject(JSON.parse(json));
        this.ui.sketchView.draw();
        this.ui.infoPane.updateConstraintList(this.sketch.constraints);
        if(push) this.ui.sketchView.pushState();
    }
    exportSketch() {
        return JSON.stringify(this.sketch.asObject());
    }
    resetSketch() {
        this.sketch = new Sketch();
        this.ui.sketchView.draw();
        this.ui.infoPane.updateConstraintList(this.sketch.constraints);
        this.ui.sketchView.pushState();
    }
    loadFromURL(url: string) {
        let request = new XMLHttpRequest();
        let _this = this;
        request.addEventListener("load", function () {
            _this.loadSketch(this.responseText);
        });
        request.open("GET", url);
        request.send();
    }
}

