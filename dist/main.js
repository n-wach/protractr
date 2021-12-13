"use strict";
/**
 * @module main
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var protractr_1 = require("./protractr");
var canvas;
var topBar;
var sidePane;
var protractr;
var adjustCanvasResolution = function (event) {
    canvas.width = canvas.parentElement.clientWidth - 1;
    canvas.height = window.innerHeight - document.getElementsByClassName("title")[0].clientHeight - 5;
    protractr.ui.sketchView.draw();
};
window.addEventListener("resize", adjustCanvasResolution);
window.addEventListener("load", function () {
    canvas = document.getElementById("canvas");
    sidePane = document.getElementById("side-pane");
    topBar = document.getElementById("tools");
    protractr = new protractr_1.default(canvas, sidePane, topBar);
    adjustCanvasResolution(null);
    console.log("________                __                        __                   " + "\n" +
        "\\_____  \\_______  _____/  |_____________    _____/  |________        " + "\n" +
        "|    ___/\\_  __ \\/  _ \\   __\\_  __ \\__  \\ _/ ___\\   __\\_  __ \\" + "\n" +
        "|   |     |  | \\(  <_> )  |  |  | \\// __ \\\\  \\___|  |  |  | \\/   " + "\n" +
        "|___|     |__|   \\____/|__|  |__|  (____  /\\___  >__|  |__|          " + "\n" +
        "                                        \\/     \\/                                    ");
    console.log("Protractr: ", protractr);
    var example = document.location.search.substr(1);
    if (example.length > 0 && example.indexOf(".json") != -1) {
        console.log("Loading ", example);
        var path = document.location.pathname;
        var url = "examples/" + example;
        protractr.loadFromURL(url);
    }
});
//# sourceMappingURL=main.js.map