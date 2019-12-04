import {Toolbar} from "./toolbar";
import {Sidepane} from "./sidepane";
import {SketchView} from "./sketchview";
import {Protractr} from "../protractr";
import {History} from "./history";

export class UI {
    protractr: Protractr;
    toolbar: Toolbar;
    infoPane: Sidepane;
    sketchView: SketchView;
    history: History;
    constructor(protractr: Protractr, canvas: HTMLCanvasElement, sidePane: HTMLDivElement, toolbar: HTMLUListElement) {
        this.protractr = protractr;
        this.history = new History(protractr.exportSketch());
        this.sketchView = new SketchView(this, canvas);
        this.infoPane = new Sidepane(this, sidePane);
        this.toolbar = new Toolbar(toolbar, this.sketchView);
    }
    reload() {
        this.sketchView.draw();
        this.infoPane.existingConstraintsList.setUnfilteredConstraints(this.protractr.sketch.constraints);
        this.infoPane.selectedFiguresList.clear();
        this.infoPane.possibleNewConstraintsList.update();
        this.infoPane.selectedFigureView.setFigure(null);
    }
    refresh() {
        this.sketchView.draw();
        this.infoPane.existingConstraintsList.setUnfilteredConstraints(this.protractr.sketch.constraints);
        this.infoPane.possibleNewConstraintsList.update();
        this.infoPane.selectedFiguresList.updateTitle();
        if(this.infoPane.selectedFiguresList.list.values.length == 1) {
            let fig = this.infoPane.selectedFiguresList.list.values[0];
            this.infoPane.selectedFigureView.setFigure(fig);
        } else {
            this.infoPane.selectedFigureView.setFigure(null);
        }
    }
}
