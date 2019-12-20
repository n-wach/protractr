/**
 * @module ui/sidepane
 */
/** */

import {CircleFigure, Figure, getFullName, LineFigure, PointFigure} from "../gcs/figures";
import {getSatisfiedConstraintFilters, sortFigureSelection} from "../gcs/constraintFilter";
import {Constraint, Variable} from "../gcs/constraint";
import {UI} from "./ui";

export class Sidepane {
    sidePane: HTMLDivElement;

    selectedFiguresList: SelectedFigureList;
    existingConstraintsList: ExistingConstraintList;
    possibleNewConstraintsList: PossibleNewConstraintsList;

    selectedFigureView: FigureInfoView;

    ui: UI;

    constructor(ui: UI, sidePane: HTMLDivElement) {
        this.ui = ui;
        this.sidePane = sidePane;

        this.selectedFiguresList = new SelectedFigureList(ui);
        this.sidePane.appendChild(this.selectedFiguresList.div);

        this.selectedFigureView = new FigureInfoView(ui);
        this.sidePane.appendChild(this.selectedFigureView.div);

        this.possibleNewConstraintsList = new PossibleNewConstraintsList(ui);
        this.sidePane.appendChild(this.possibleNewConstraintsList.div);

        this.existingConstraintsList = new ExistingConstraintList(ui);
        this.sidePane.appendChild(this.existingConstraintsList.div);

    }
}

export class FigureInfoView {
    div: HTMLDivElement;
    ui: UI;
    fields: HTMLInputElement[];
    variables: Variable[];

    constructor(ui: UI) {
        this.ui = ui;
        this.div = document.createElement("div");
        this.fields = [];
        this.variables = [];
    }

    refresh() {
        for(let i = 0; i < this.variables.length; i++) {
            this.fields[i].value = "" + this.variables[i].value;
        }
    }

    setFigure(figure: Figure) {
        this.fields = [];
        this.variables = [];
        while(this.div.lastChild) {
            this.div.removeChild(this.div.lastChild);
        }
        if (figure) {
            switch(figure.type) {
                case "point":
                    let point: PointFigure = figure as PointFigure;
                    this.addVariable(point.p.variablePoint.x, "x");
                    this.addVariable(point.p.variablePoint.y, "y");
                    break;
                case "line":
                    let line: LineFigure = figure as LineFigure;
                    this.addVariable(line.p1.variablePoint.x, "x1");
                    this.addVariable(line.p1.variablePoint.y, "y1");
                    this.addVariable(line.p2.variablePoint.x, "x2");
                    this.addVariable(line.p2.variablePoint.y, "y2");
                    break;
                case "circle":
                    let circle: CircleFigure = figure as CircleFigure;
                    this.addVariable(circle.c.variablePoint.x, "center x");
                    this.addVariable(circle.c.variablePoint.y, "center y");
                    this.addVariable(circle.r, "radius");
                    break;
            }
        }
    }

    addVariable(variable: Variable, name: string) {
        let div = document.createElement("div");
        let label = document.createElement("span");
        label.innerText = name + ":";
        div.appendChild(label);
        let field = document.createElement("input");
        field.type = "number";
        field.value = "" + variable.value;
        field.step = "any";
        let _this = this;
        field.onchange = function() {
            variable.value = parseFloat(field.value);
            variable.constant = true;
            _this.ui.protractr.sketch.solveConstraints(true);
            variable.constant = false;
            _this.ui.pushState();
            _this.ui.refresh();
        };
        div.appendChild(field);
        this.div.appendChild(div);
        this.fields.push(field);
        this.variables.push(variable);
    }
}

export class ConstraintInfoView {

}

export class PossibleNewConstraintsList {
    div: HTMLDivElement;
    constraintsDiv: HTMLDivElement;
    title: HTMLParagraphElement;
    ui: UI;

    constructor(ui: UI) {
        this.ui = ui;
        this.div = document.createElement("div");
        this.constraintsDiv = document.createElement("div");
        this.title = document.createElement("p");
        this.title.innerText = "";
        this.div.appendChild(this.title);
        this.div.appendChild(this.constraintsDiv);
    }

    update() {
        while(this.constraintsDiv.lastChild) {
            this.constraintsDiv.removeChild(this.constraintsDiv.lastChild);
        }
        let figs = this.ui.infoPane.selectedFiguresList.list.values;
        if (figs.length == 0) {
            this.title.innerText = "";
            this.title.style.display = "none";
            return;
        }
        this.title.style.display = "block";
        let filters = getSatisfiedConstraintFilters(figs);
        if (filters.length == 0) {
            this.title.innerText = "No possible constraints";
            return;
        }
        this.title.innerText = "Add a constraint:";
        for(let filter of filters) {
            let b = document.createElement("button");
            b.innerText = filter.name;
            let _this = this;
            b.onclick = function() {
                _this.ui.protractr.sketch.addConstraints(filter.createConstraints(sortFigureSelection(figs)));
                _this.ui.pushState();
                _this.ui.refresh();
            };
            this.constraintsDiv.appendChild(b);
        }
    }
}

export class ExistingConstraintList {
    div: HTMLDivElement;
    list: TitledInteractiveList<Constraint>;
    ui: UI;

    constructor(ui: UI) {
        this.ui = ui;
        this.div = document.createElement("div");
        this.list = new TitledInteractiveList<Constraint>(false);
        this.list.setTitle("No constraints in sketch");
        this.list.onhover = this.ui.refresh.bind(this.ui);
        this.list.onclick = this.ui.refresh.bind(this.ui);
        this.div.appendChild(this.list.div);
    }

    figureInHovered(fig: Figure) {
        for(let hover of this.list.hovered) {
            if (hover.containsFigure(fig)) return true;
        }
        return false;
    }

    setConstraints(newConstraints: Constraint[]) {
        let elements: [Constraint, string][] = [];
        for(let constraint of newConstraints) {
            elements.push([constraint, constraint.name]);
        }
        this.list.setElements(elements);
        let count = this.ui.infoPane.selectedFiguresList.count();
        if (newConstraints.length == 0) {
            if (count == 0) {
                this.list.setTitle("No constraints in sketch");
            } else if (count == 1) {
                this.list.setTitle("No constraints on selected figure");
            } else {
                this.list.setTitle("No constraints exist between the selected figures");
            }
        } else {
            if (count == 0) {
                this.list.setTitle("Sketch Constraints:");
            } else if (count == 1) {
                this.list.setTitle("Figure Constraints:");
            } else {
                this.list.setTitle("Selection Constraints:");
            }
        }
    }

    setUnfilteredConstraints(constraints: Constraint[]) {
        let filteredConstraints = [];
        for(let constraint of constraints) {
            let add = true;
            for(let figure of this.ui.infoPane.selectedFiguresList.list.values) {
                if (!constraint.containsFigure(figure)) {
                    add = false;
                    break;
                }
            }
            if (add) filteredConstraints.push(constraint);
        }
        this.setConstraints(filteredConstraints);
    }

    addConstraint(constraint: Constraint) {
        this.list.addElement(constraint, constraint.name);
    }

    removeConstraint(constraint: Constraint) {
        this.list.removeElement(constraint);
    }

    contains(constraint: Constraint) {
        return this.list.values.indexOf(constraint) != -1;
    }
}

export class SelectedFigureList {
    div: HTMLDivElement;
    list: TitledInteractiveList<Figure>;
    ui: UI;

    constructor(ui: UI) {
        this.ui = ui;
        this.div = document.createElement("div");
        this.list = new TitledInteractiveList<Figure>();
        this.list.onhover = this.ui.refresh.bind(this.ui);
        this.list.ondelete = this.ui.refresh.bind(this.ui);
        this.div.appendChild(this.list.div);
    }

    clear() {
        this.list.clear();
        this.ui.refresh();
    }

    setFigures(figures: Figure[]) {
        let elements: [Figure, string][] = [];
        for(let figure of figures) {
            elements.push([figure, getFullName(figure)]);
        }
        this.list.setElements(elements);
        this.ui.refresh();
    }

    addFigure(figure: Figure) {
        this.list.addElement(figure, getFullName(figure));
        this.ui.refresh();
    }

    updateTitle() {
        let count = this.count();
        if (count == 0) {
            this.list.setTitle("");
        } else if (count == 1) {
            this.list.setTitle("Selected Figure:");
        } else {
            this.list.setTitle("Selected Figures:");
        }
    }

    removeFigure(figure: Figure) {
        this.list.removeElement(figure);
        this.ui.refresh();
    }

    figureSelected(figure: Figure) {
        return this.list.values.indexOf(figure) != -1;
    }

    figureHovered(fig: Figure) {
        return this.list.hovered.indexOf(fig) != -1;
    }

    count() {
        return this.list.values.length;
    }
}

export class InteractiveList<T> {
    div: HTMLDivElement;
    list: HTMLDivElement;
    values: T[];
    hovered: T[];
    elements: ListElement<T>[];
    onhover: Function;
    ondelete: Function;
    onclick: Function;
    deleteable: boolean;

    constructor(deleteable: boolean = true) {
        this.deleteable = deleteable;
        this.div = document.createElement("div");
        this.list = document.createElement("div");
        this.list.classList.add("interactive-list");
        this.div.appendChild(this.list);
        this.clear();
    }

    clear(noEvent: boolean = false) {
        this.hovered = [];
        this.values = [];
        this.elements = [];
        while(this.list.lastChild) {
            this.list.removeChild(this.list.lastChild);
        }
        if (this.onhover && !noEvent) this.onhover([]);
    }

    setElements(elements: [T, string][]) {
        let toRemove = [];
        for(let value of this.values) {
            let remove = true;
            for(let element of elements) {
                if (element[0] == value) {
                    remove = false;
                    break;
                }
                ;
            }
            if (remove) toRemove.push(value);
        }
        for(let remove of toRemove) {
            this.removeElement(remove);
        }
        for(let element of elements) {
            if (this.values.indexOf(element[0]) == -1) this.addElement(element[0], element[1]);
        }
    }

    addElement(value: T, name: string) {
        let element = new ListElement(this, value, name, this.deleteable);
        this.list.appendChild(element.div);
        this.elements.push(element);
        this.values.push(value);
    }

    removeElement(value: T) {
        let index = this.values.indexOf(value);
        if (index > -1) {
            this.unhover(value);
            this.values.splice(index, 1);
            this.list.removeChild(this.elements[index].div);
            this.elements.splice(index, 1);
        }
    }

    hover(item: T) {
        this.hovered.push(item);
        if (this.onhover) this.onhover(this.hovered);
    }

    unhover(item: T) {
        let index = this.hovered.indexOf(item);
        if (index > -1) {
            this.hovered.splice(index, 1);
            if (this.onhover) this.onhover(this.hovered);
        }
    }

    clicked(item: T) {

    }

    delete(item: T) {
        this.removeElement(item);
        if (this.ondelete) this.ondelete(item);
    }
}

export class TitledInteractiveList<T> extends InteractiveList<T> {
    p: HTMLParagraphElement;

    constructor(deleteable: boolean = true) {
        super(deleteable);
        this.p = document.createElement("p");
        this.div.prepend(this.p);
        this.setTitle("");
    }

    setTitle(value: string) {
        if (value == "") {
            this.p.style.display = "none";
            this.p.innerText = "";
        } else {
            this.p.style.display = "block";
            this.p.innerText = value;
        }
    }
}

export class ListElement<T> {
    div: HTMLDivElement;
    spanName: HTMLSpanElement;
    deleteButton: HTMLSpanElement;
    value: T;
    parent: InteractiveList<T>;
    selected: boolean;

    constructor(parent: InteractiveList<T>, value: T, name: string, deleteable: boolean = true) {
        this.value = value;
        this.parent = parent;

        this.div = document.createElement("div");
        this.div.classList.add("interactive-list-element");
        this.div.addEventListener("mouseenter", this.onmouseenter.bind(this));
        this.div.addEventListener("mouseleave", this.onmouseleave.bind(this));
        this.div.addEventListener("mousedown", this.onmousedown.bind(this));

        this.spanName = document.createElement("span");
        this.spanName.innerText = name;
        this.spanName.classList.add("element-name");
        this.div.appendChild(this.spanName);

        if (deleteable) {
            this.deleteButton = document.createElement("span");
            this.deleteButton.classList.add("element-delete");
            this.deleteButton.addEventListener("mousedown", this.delete.bind(this));
            this.div.appendChild(this.deleteButton);
        }
    }

    onmouseenter(event) {
        this.parent.hover(this.value);
    }

    onmouseleave(event) {
        this.parent.unhover(this.value);
    }

    onmousedown(event) {
        if (event.which == 1) {
            this.parent.clicked(this.value);
        }
    }

    delete(event) {
        if (event.which == 1) {
            this.parent.delete(this.value);
        }
    }
}

