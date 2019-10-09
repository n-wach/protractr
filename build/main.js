"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var protractr_1 = require("./protractr");
var canvas;
var tools;
var sidePane;
var adjustCanvasResolution = function (event) {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
};
window.addEventListener("resize", adjustCanvasResolution);
window.addEventListener("load", function () {
    canvas = document.getElementById("canvas");
    exports.ctx = canvas.getContext("2d");
    sidePane = document.getElementById("side-pane");
    tools = document.getElementById("tools");
    exports.protractr = new protractr_1.Protractr(exports.ctx, sidePane, tools);
    adjustCanvasResolution(null);
});
//# sourceMappingURL=main.js.map