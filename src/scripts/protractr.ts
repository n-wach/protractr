/**
 * @module protractr
 */
/** */
import Sketch from "./gcs/sketch";
import UI from "./ui/ui";
import IO from "./ui/io/io";

export default class Protractr {
    sketch: Sketch;
    ui: UI;

    constructor(canvas: HTMLCanvasElement, sidePane: HTMLDivElement, topBar: HTMLDivElement) {
        this.sketch = new Sketch();
        this.ui = new UI(this, canvas, sidePane, topBar);
    }

    loadFromURL(url: string) {
        let request = new XMLHttpRequest();
        let _this = this;
        request.addEventListener("load", function() {
            if (this.status == 200) {
                _this.sketch = IO.DEFAULT_IMPORT.stringToSketch(this.responseText);
                _this.ui.update();
            } else {
                console.log("Failed to load sketch, response code != 200: ", this);
            }
        });
        request.open("GET", url);
        request.send();
    }
}

