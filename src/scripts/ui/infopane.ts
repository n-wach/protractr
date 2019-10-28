import {Figure} from "../gcs/figures";
import {getPossibleConstraints} from "../gcs/constraint";
import {protractr} from "../main";

export class InfoPane {
    sidePane: HTMLDivElement;
    title: HTMLParagraphElement;
    possibleConstraints: HTMLDivElement;
    constructor(sidePane: HTMLDivElement) {
        this.sidePane = sidePane;

        this.title = document.createElement("p");
        this.sidePane.appendChild(this.title);

        let d = document.createElement("p");
        d.innerText = "Possible Constraints:";
        this.sidePane.appendChild(d);

        this.possibleConstraints = document.createElement("div");
        this.sidePane.appendChild(this.possibleConstraints);
    }
    setFocusedFigures(figures: Figure[]) {
        if(figures === null || figures.length == 0) {
            this.title.innerText = "Nothing selected";
        } else if(figures.length == 1) {
            this.title.innerText = "Selected " + figures[0].type;
        } else {
            this.title.innerText = "Multiple things selected";
        }
        while(this.possibleConstraints.lastChild) {
            this.possibleConstraints.removeChild(this.possibleConstraints.lastChild);
        }
        for(let pc of getPossibleConstraints(figures)) {
            let child = document.createElement("button");
            child.innerText = pc.possibleConstraint;
            child.addEventListener("click", function () {
                let constraint = pc.makeConstraint(figures);
                if(constraint != undefined) protractr.sketch.addConstraint(constraint);
            });
            this.possibleConstraints.appendChild(child);
        }
    }

}