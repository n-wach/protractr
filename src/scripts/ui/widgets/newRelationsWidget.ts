/**
 * @module ui/widgets
 */
/** */

import UI from "../ui";
import RelationCreator, {RelationEnvironment} from "../../gcs/relations/creator";
import TitledWidget from "./titledWidget";

export default class NewRelationsWidget extends TitledWidget {
    constraintsDiv: HTMLDivElement;

    constructor(ui: UI) {
        super(ui);
        this.constraintsDiv = document.createElement("div");
        this.div.appendChild(this.constraintsDiv);
    }

    update() {
        super.update();
        while(this.constraintsDiv.lastChild) {
            this.constraintsDiv.removeChild(this.constraintsDiv.lastChild);
        }
        let figures = this.ui.selectedFigures.elements;
        if(figures.length == 0) {
            this.setVisible(false);
            return;
        }
        this.setVisible(true);
        let environments: RelationEnvironment[] = RelationCreator.getSatisfiedEnvironments(figures);
        if(environments.length == 0) {
            this.setTitle("No possible relations");
            return;
        }
        this.setTitle("Add a relation:");

        for(let environment of environments) {
            let b = document.createElement("button");
            b.innerText = environment.name;
            let _this = this;
            b.onclick = function() {
                let relations = RelationCreator.createRelations(figures, environment);
                _this.ui.protractr.sketch.relationManager.addRelations(...relations);
                _this.ui.pushState();
                _this.ui.update();
            };
            this.constraintsDiv.appendChild(b);
        }
    }
}