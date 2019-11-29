import {CircleFigure, Figure, getFullName, LineFigure, PointFigure} from "../gcs/figures";
import {protractr} from "../main";
import {getSatisfiedConstraintFilters, sortFigureSelection} from "../gcs/constraint_filter";
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
        if(figure) {
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
        field.onchange = function() {
            variable.value = parseFloat(field.value);
            variable.constant = true;
            protractr.sketch.solveConstraints(true);
            variable.constant = false;
            protractr.ui.history.recordStateChange(protractr.exportSketch());
            protractr.ui.refresh();
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
        if(figs.length == 0) {
            this.title.innerText = "";
            return;
        }
        let filters = getSatisfiedConstraintFilters(figs);
        if(filters.length == 0) {
            this.title.innerText = "No possible constraints";
            return;
        }
        this.title.innerText = "Add a constraint:";
        for(let filter of filters) {
            let b = document.createElement("button");
            b.innerText = filter.name;
            b.onclick = function() {
                protractr.sketch.addConstraints(filter.createConstraints(sortFigureSelection(figs)));
            };
            this.constraintsDiv.appendChild(b);
        }
    }
}

export class ExistingConstraintList {
    div: HTMLDivElement;
    list: InteractiveList<Constraint>;
    title: HTMLParagraphElement;
    ui: UI;
    constructor(ui: UI) {
        this.ui = ui;
        this.div = document.createElement("div");
        this.title = document.createElement("p");
        this.title.innerText = "Sketch has no constraints";
        this.div.appendChild(this.title);
        this.list = new InteractiveList<Constraint>([], true, true);
        this.list.onhoveredchanged = this.onhoveredchanged.bind(this);
        this.list.onselectedchanged = this.onselectedchanged.bind(this);
        this.div.appendChild(this.list.div);
    }
    figureInHovered(fig: Figure) {
        for(let hover of this.list.hovered) {
            if(hover.containsFigure(fig)) return true;
        }
        return false;
    }
    setConstraints(newConstraints: Constraint[]) {
        let toRemove = [];
        for(let constraint of this.list.values) {
            if(newConstraints.indexOf(constraint) == -1) {
                toRemove.push(constraint);
            }
        }
        for(let remove of toRemove) {
            this.removeConstraint(remove);
        }
        for(let constraint of newConstraints) {
            if(!this.contains(constraint)) this.addConstraint(constraint);
        }
        let count = this.ui.infoPane.selectedFiguresList.count();
        if(count == 0) {
            if(newConstraints.length == 0) {
                this.title.innerText = "Sketch has no constraints";
            } else {
                this.title.innerText = "Sketch Constraints:";
            }
        } else {
            if(newConstraints.length == 0) {
                if(count == 1) {
                    this.title.innerText = "The selected figure has no constraints";
                } else {
                    this.title.innerText = "No constraints exist between the selected figures";
                }
            } else {
                this.title.innerText = "Existing constraints:";
            }
        }
    }
    setUnfilteredConstraints(constraints: Constraint[]) {
        let filteredConstraints = [];
        for(let constraint of constraints) {
            let add = true;
            for(let figure of this.ui.infoPane.selectedFiguresList.list.values) {
                if(!constraint.containsFigure(figure)) {
                    add = false;
                    break;
                }
            }
            if(add) filteredConstraints.push(constraint);
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
    onhoveredchanged() {
        this.ui.refresh();
    }
    onselectedchanged() {
        this.ui.refresh();
    }
}

export class SelectedFigureList {
    div: HTMLDivElement;
    list: InteractiveList<Figure>;
    title: HTMLParagraphElement;
    ui: UI;
    constructor(ui: UI) {
        this.ui = ui;
        this.div = document.createElement("div");
        this.title = document.createElement("p");
        this.title.innerText = "";
        this.div.appendChild(this.title);
        this.list = new InteractiveList<Figure>([], false);
        this.list.onhoveredchanged = this.onhoveredchanged.bind(this);
        this.div.appendChild(this.list.div);
    }
    clear() {
        this.list.clear();
        this.updateTitle();
    }
    addFigure(figure: Figure) {
        this.list.addElement(figure, getFullName(figure));
        this.updateTitle();
    }
    updateTitle() {
        let count = this.count();
        if(count == 0) {
            this.title.innerText = "";
        } else if (count == 1) {
            this.title.innerText = "Selected Figure:";
        } else {
            this.title.innerText = "Selected Figures:";
        }
    }
    removeFigure(figure: Figure) {
        this.list.removeElement(figure);
        this.updateTitle();
    }
    contains(figure: Figure) {
        return this.list.values.indexOf(figure) != -1;
    }
    onhoveredchanged() {
        this.ui.refresh();
    }
    onselectedchanged() {
        this.ui.refresh();
    }
    figureInHovered(fig: Figure) {
        return this.list.hovered.indexOf(fig) != -1;
    }
    count() {
        return this.list.values.length;
    }
}

export class InteractiveList<T> {
    div: HTMLDivElement;
    selected: T[];
    hovered: T[];
    values: T[];
    elements: ListElement<T>[];
    onhoveredchanged: Function;
    onselectedchanged: Function;
    selectable: boolean;
    hoverable: boolean;
    singleSelect: boolean;
    constructor(items: [T, string][]=[], selectable: boolean=true, singleSelect: boolean=false, hoverable:boolean=true) {
        this.div = document.createElement("div");
        this.div.classList.add("interactive-list");
        this.clear();
        for(let item of items) {
            this.addElement(item[0], item[1]);
        }
        this.hoverable = hoverable;
        this.selectable = selectable;
        this.singleSelect = singleSelect;
    }
    clear(noEvent: boolean=false) {
        this.selected = [];
        this.hovered = [];
        this.values = [];
        this.elements = [];
        while(this.div.lastChild) {
            this.div.removeChild(this.div.lastChild);
        }
        if(this.onselectedchanged && !noEvent) this.onselectedchanged([]);
        if(this.onhoveredchanged && !noEvent) this.onhoveredchanged([]);
    }
    addElement(value: T, name: string) {
        let element = new ListElement(this, value, name);
        this.div.appendChild(element.p);
        this.elements.push(element);
        this.values.push(value);
    }
    removeElement(value: T) {
        this.unhover(value);
        this.unselect(value);
        let index = this.values.indexOf(value);
        if (index > -1) {
            this.values.splice(index, 1);
            this.div.removeChild(this.elements[index].p);
            this.elements.splice(index, 1);
        }
    }
    hover(item: T) {
        if(!this.hoverable) return;
        this.hovered.push(item);
        if(this.onhoveredchanged) this.onhoveredchanged(this.hovered);
    }
    unhover(item: T) {
        if(!this.hoverable) return;
        let index = this.hovered.indexOf(item);
        if (index > -1) {
            this.hovered.splice(index, 1);
            if(this.onhoveredchanged) this.onhoveredchanged(this.hovered);
        }
    }
    select(item: T) {
        if(!this.selectable) return;
        if(this.singleSelect) {
            for(let item of this.selected) {
                this.elements[this.values.indexOf(item)].unselect();
            }
        }
        this.selected.push(item);
        if(this.onselectedchanged) this.onselectedchanged(this.selected);
    }
    unselect(item: T) {
        if(!this.selectable) return;
        let index = this.selected.indexOf(item);
        if (index > -1) {
            this.selected.splice(index, 1);
            if(this.onselectedchanged) this.onselectedchanged(this.selected);
        }
    }
}

export class ListElement<T> {
    p: HTMLParagraphElement;
    value: T;
    parent: InteractiveList<T>;
    selected: boolean;
    constructor(parent: InteractiveList<T>, value: T, name: string) {
        this.value = value;
        this.parent = parent;
        this.p = document.createElement("p");
        this.p.classList.add("interactive-list-element");
        this.p.innerText = name;
        this.p.addEventListener("mouseenter", this.onmouseenter.bind(this));
        this.p.addEventListener("mouseleave", this.onmouseleave.bind(this));
        this.p.addEventListener("mousedown", this.onmousedown.bind(this));
    }
    onmouseenter(event) {
        this.parent.hover(this.value);
        this.p.classList.add("hovered");
    }
    onmouseleave(event) {
        this.parent.unhover(this.value);
        this.p.classList.remove("hovered");
    }
    onmousedown(event) {
        if(event.which == 1) {
            if(this.selected) {
                this.unselect();
            } else {
                this.select();
            }
        }
    }
    select() {
        if(!this.parent.selectable) return;
        this.selected = true;
        this.parent.select(this.value);
        this.p.classList.add("selected");
    }
    unselect() {
        this.selected = false;
        this.parent.unselect(this.value);
        this.p.classList.remove("selected");
    }
}

