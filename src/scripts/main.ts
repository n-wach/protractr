/**
 * @module main
 */
/** */

import Protractr from "./protractr";

let canvas: HTMLCanvasElement;
let topBar: HTMLDivElement;
let sidePane: HTMLDivElement;
let protractr: Protractr;


let adjustCanvasResolution = function(event) {
    canvas.width = canvas.parentElement.clientWidth - 1;
    canvas.height = window.innerHeight - document.getElementsByClassName("title")[0].clientHeight - 5;
    protractr.ui.sketchView.draw();
};
window.addEventListener("resize", adjustCanvasResolution);

window.addEventListener("load", function() {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    sidePane = document.getElementById("side-pane") as HTMLDivElement;
    topBar = document.getElementById("tools") as HTMLDivElement;
    protractr = new Protractr(canvas, sidePane, topBar);
    adjustCanvasResolution(null);
    console.log("________                __                        __                   " + "\n" +
        "\\_____  \\_______  _____/  |_____________    _____/  |________        " + "\n" +
        "|    ___/\\_  __ \\/  _ \\   __\\_  __ \\__  \\ _/ ___\\   __\\_  __ \\" + "\n" +
        "|   |     |  | \\(  <_> )  |  |  | \\// __ \\\\  \\___|  |  |  | \\/   " + "\n" +
        "|___|     |__|   \\____/|__|  |__|  (____  /\\___  >__|  |__|          " + "\n" +
        "                                        \\/     \\/                                    ");
    console.log("Protractr: ", protractr);
    let example = document.location.search.substr(1);
    if (example.length > 0 && example.indexOf(".json") != -1) {
        console.log("Loading ", example);
        let path = document.location.pathname;
        let origin = path.substr(0, path.indexOf("/src/"));
        let url = origin + "/examples/" + example;
        protractr.loadFromURL(url);
    }
});
