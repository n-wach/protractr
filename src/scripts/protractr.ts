/**
 * @module protractr
 */
/** */
import {Sketch} from "./gcs/sketch";
import UI from "./ui/ui";

export default class Protractr {
    sketch: Sketch;
    ui: UI;

    constructor(canvas: HTMLCanvasElement, sidePane: HTMLDivElement, topBar: HTMLDivElement) {
        this.sketch = new Sketch();
        this.ui = new UI(this, canvas, sidePane, topBar);
    }

    loadSketch(json: string, push: boolean = true) {
        if (json == undefined) {
            this.resetSketch();
            return;
        }
        //this.sketch = Sketch.fromObject(JSON.parse(json));
        this.ui.update();
    }

    exportSketch(): string {
        return ""; //JSON.stringify(this.sketch.asObject());
    }

    resetSketch() {
        this.sketch = new Sketch();
        this.ui.update();
    }

    loadFromURL(url: string) {
        let request = new XMLHttpRequest();
        let _this = this;
        request.addEventListener("load", function() {
            if (this.status == 200) {
                _this.loadSketch(this.responseText);
            } else {
                console.log("Failed to load sketch, response code != 200: ", this);
            }
        });
        request.open("GET", url);
        request.send();
    }
}

