/**
 * @module ui/sidepane
 */
/** */

import UI from "../ui";
import Widget from "./widget";
import SelectedFigureWidget from "./selectedFigureWidget";
import NewRelationsWidget from "./newRelationsWidget";
import RelationListWidget from "./relationListWidget";
import SelectedFigureListWidget from "./selectedFigureListWidget";

export default class SidePanel extends Widget {
    constructor(ui: UI, sidePane: HTMLDivElement) {
        super(ui, sidePane);
        this.addWidget(new SelectedFigureListWidget(ui));
        this.addWidget(new SelectedFigureWidget(ui));
        this.addWidget(new NewRelationsWidget(ui));
        this.addWidget(new RelationListWidget(ui));
    }
}

