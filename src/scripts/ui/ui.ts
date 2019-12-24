/**
 * @module ui
 */
/** */

import SidePanel from "./widgets/sidePanel";
import SketchView from "./sketchview";
import Protractr from "../protractr";
import History from "./history";
import TopBar from "./topbar";
import Figure from "../gcs/geometry/figure";
import Relation from "../gcs/relations/relation";
import Container from "./container";
import IO from "./io/io";

export default class UI {
    protractr: Protractr;
    topBar: TopBar;
    sidePanel: SidePanel;
    sketchView: SketchView;
    history: History;
    selectedFigures: Container<Figure>;
    boldFigures: Container<Figure>;
    selectedRelations: Container<Relation>;

    constructor(protractr: Protractr, canvas: HTMLCanvasElement, sidePane: HTMLDivElement, topBar: HTMLDivElement) {
        this.protractr = protractr;
        this.history = new History(IO.HISTORY_EXPORT.sketchToString(protractr.sketch));
        this.sketchView = new SketchView(this, canvas);
        this.sidePanel = new SidePanel(this, sidePane);
        this.topBar = new TopBar(protractr, topBar);
        this.selectedFigures = new Container<Figure>([], this.update.bind(this));
        this.boldFigures = new Container<Figure>([], this.update.bind(this));
        this.selectedRelations = new Container<Relation>([], this.update.bind(this));
        this.update();
    }

    pushState() {
        let e = IO.HISTORY_EXPORT.sketchToString(this.protractr.sketch);
        this.history.recordStateChange(e);
    }

    restoreState(state: string) {
        this.protractr.setSketch(IO.DEFAULT_IMPORT.stringToSketch(state));
    }

    update() {
        this.sidePanel.update();
        this.sketchView.draw();
    }
}
