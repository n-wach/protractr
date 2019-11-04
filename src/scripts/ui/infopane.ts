import {Figure, getFullName} from "../gcs/figures";
import {protractr} from "../main";
import {getSatisfiedConstraintFilters, sortFigureSelection} from "../gcs/constraint_filter";
import {Constraint} from "../gcs/constraint";

export class InfoPane {
    sidePane: HTMLDivElement;
    title: HTMLParagraphElement;
    possibleConstraints: HTMLDivElement;
    existingConstraints: HTMLSelectElement;

    constructor(sidePane: HTMLDivElement) {
        this.sidePane = sidePane;

        this.title = document.createElement("p");
        this.sidePane.appendChild(this.title);

        let d = document.createElement("p");
        d.innerText = "Possible Constraints:";
        this.sidePane.appendChild(d);

        this.possibleConstraints = document.createElement("div");
        this.sidePane.appendChild(this.possibleConstraints);

        let e = document.createElement("p");
        e.innerText = "Existing Constraints:";
        this.sidePane.appendChild(e);

        this.existingConstraints = document.createElement("select");
        this.existingConstraints.multiple = true;
        this.existingConstraints.style.width = "100%";
        this.existingConstraints.style.height = "200px";
        this.sidePane.appendChild(this.existingConstraints);

    }
    setFocusedFigures(figures: Figure[]) {
        if(figures === null || figures.length == 0) {
            this.title.innerText = "Nothing selected";
        } else {
            this.title.innerText = "Selected " + figures.map(getFullName).join(", ");
        }
        while(this.possibleConstraints.lastChild) {
            this.possibleConstraints.removeChild(this.possibleConstraints.lastChild);
        }
        for(let pc of getSatisfiedConstraintFilters(figures)) {
            let child = document.createElement("button");
            child.innerText = pc.name;
            child.addEventListener("click", function () {
                let sortedFigures = sortFigureSelection(figures);
                protractr.sketch.addConstraints(pc.createConstraints(sortedFigures));
            });
            this.possibleConstraints.appendChild(child);
        }
    }
    updateConstraintList(constraints: Constraint[]) {
        while(this.existingConstraints.lastChild) {
            this.existingConstraints.removeChild(this.existingConstraints.lastChild);
        }
        for(let constraint of constraints) {
            let o = document.createElement("option");
            o.innerText = (constraint.constructor as any).name;
            this.existingConstraints.appendChild(o);
            o.oncontextmenu = function(event) {
                event.preventDefault();
                if(event.which == 3) protractr.sketch.removeConstraint(constraint);
            }
        }
        console.log("Update list");
    }
}