import {Figure, getFullName} from "../gcs/figures";
import {protractr} from "../main";
import {getSatisfiedConstraintFilters, sortFigureSelection} from "../gcs/constraint_filter";
import {Constraint} from "../gcs/constraint";
import {UI} from "./ui";

export class InfoPane {
    sidePane: HTMLDivElement;
    title: HTMLParagraphElement;
    possibleConstraints: HTMLDivElement;
    existingConstraints: HTMLDivElement;
    ui: UI;

    constructor(ui: UI, sidePane: HTMLDivElement) {
        this.ui = ui;
        this.sidePane = sidePane;

        this.title = document.createElement("p");
        this.sidePane.appendChild(this.title);

        let d = document.createElement("p");
        d.innerText = "Possible Constraints:";
        this.sidePane.appendChild(d);

        this.possibleConstraints = document.createElement("div");
        this.sidePane.appendChild(this.possibleConstraints);

        let e = document.createElement("p");
        e.innerText = "Sketch Constraints:";
        this.sidePane.appendChild(e);

        this.existingConstraints = document.createElement("div");
        this.existingConstraints.classList.add("existing-constraints");
        this.existingConstraints.style.width = "100%";
        this.existingConstraints.style.height = "400px";
        this.existingConstraints.style.overflowY = "scroll";
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
        for(let constraintFilter of getSatisfiedConstraintFilters(figures)) {
            let child = document.createElement("button");
            child.innerText = constraintFilter.name;
            let _this = this;
            child.addEventListener("click", function () {
                let sortedFigures = sortFigureSelection(figures);
                _this.ui.protractr.sketch.addConstraints(constraintFilter.createConstraints(sortedFigures));
                _this.ui.sketchView.pushState(); // constraint added
            });
            this.possibleConstraints.appendChild(child);
        }
    }
    updateConstraintList(constraints: Constraint[]) {
        while(this.existingConstraints.lastChild) {
            this.existingConstraints.removeChild(this.existingConstraints.lastChild);
        }
        let figs = this.ui.sketchView.selectedFigures;
        for(let constraint of constraints) {
            let add = true;
            for(let selectedFigure of figs) {
                if(!constraint.containsFigure(selectedFigure)) {
                    add = false;
                    break;
                }
            }
            if(add) this.addConstraintElement(constraint);
        }
    }
    addConstraintElement(constraint: Constraint){
        let o = document.createElement("p");
        o.innerText = constraint.name;
        o.classList.add("existing-constraint");
        let _this = this;
        o.oncontextmenu = function(event) {
            event.preventDefault();
            if(event.which == 3) {
                _this.ui.protractr.sketch.removeConstraint(constraint);
                _this.ui.sketchView.pushState(); // constraint removed
            }
            _this.ui.sketchView.hoveredConstraint = null;
        }
        o.onmouseenter = function (event) {
            _this.ui.sketchView.hoveredConstraint = constraint;
            _this.ui.sketchView.draw();
        }
        o.onmouseleave = function (event) {
            _this.ui.sketchView.hoveredConstraint = null;
            _this.ui.sketchView.draw();
        }
        this.existingConstraints.appendChild(o);
    }
}