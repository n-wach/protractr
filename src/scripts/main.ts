import {Protractr} from "./protractr";

let canvas: HTMLCanvasElement;
export let ctx: CanvasRenderingContext2D;
let tools: HTMLUListElement;
let sidePane: HTMLDivElement;
export let protractr: Protractr;

let adjustCanvasResolution = function(event) {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
};
window.addEventListener("resize", adjustCanvasResolution);

window.addEventListener("load", function() {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    sidePane = document.getElementById("side-pane") as HTMLDivElement;
    tools = document.getElementById("tools") as HTMLUListElement;
    adjustCanvasResolution(null);
    protractr = new Protractr(canvas, sidePane, tools);
    console.log("Protractr: ", protractr);
});
