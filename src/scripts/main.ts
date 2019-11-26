import {Protractr} from "./protractr";

let canvas: HTMLCanvasElement;
let tools: HTMLUListElement;
let sidePane: HTMLDivElement;
export let protractr: Protractr;

export function saveAs(string: string, filename: string) {
    let a = document.createElement("a");
    var data = "text/json;charset=utf-8," + encodeURIComponent(string);
    a.href = "data:" + data;
    a.download = filename;
    a.click();
}

let adjustCanvasResolution = function(event) {
    canvas.width = canvas.parentElement.clientWidth - 1;
    canvas.height = canvas.parentElement.clientHeight - 1;
    protractr.ui.sketchView.draw();
};
window.addEventListener("resize", adjustCanvasResolution);

window.addEventListener("load", function() {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    sidePane = document.getElementById("side-pane") as HTMLDivElement;
    tools = document.getElementById("tools") as HTMLUListElement;
    protractr = new Protractr(canvas, sidePane, tools);
    adjustCanvasResolution(null);
    console.log("________                __                        __                   " + "\n" +
                "\\_____  \\_______  _____/  |_____________    _____/  |________        " + "\n" +
                "|    ___/\\_  __ \\/  _ \\   __\\_  __ \\__  \\ _/ ___\\   __\\_  __ \\" + "\n" +
                "|   |     |  | \\(  <_> )  |  |  | \\// __ \\\\  \\___|  |  |  | \\/   " + "\n" +
                "|___|     |__|   \\____/|__|  |__|  (____  /\\___  >__|  |__|          " + "\n" +
"                                        \\/     \\/                                    ");
    console.log("Protractr: ", protractr);
    let example = document.location.search.substr(1);
    if(example.length > 0) {
        console.log("Loading ", example);
        let path = document.location.pathname;
        let origin = path.substr(0, path.indexOf("/src/"));
        let url = origin + "/examples/" + example;
        protractr.loadFromURL(url);
    }
});
