import {Toolbar} from "./toolbar";
import {InfoPane} from "./infopane";
import {SketchView} from "./sketchview";
import {Protractr} from "../protractr";
import {History} from "./history";

export class UI {
    protractr: Protractr;
    toolbar: Toolbar;
    infoPane: InfoPane;
    sketchView: SketchView;
    history: History;
    constructor(protractr: Protractr, canvas: HTMLCanvasElement, sidePane: HTMLDivElement, toolbar: HTMLUListElement) {
        this.protractr = protractr;
        this.history = new History(protractr.exportSketch());
        this.sketchView = new SketchView(this, canvas);
        this.infoPane = new InfoPane(this, sidePane);
        this.toolbar = new Toolbar(toolbar, this.sketchView);
    }
    refresh() {
        this.sketchView.draw();
        this.infoPane.updateConstraintList(this.protractr.sketch.constraints);
    }
}
