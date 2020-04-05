/**
 * @module ui/widgets
 */
/** */
import Widget from "./widget";
import Figure from "../../gcs/geometry/figure";
import Variable from "../../gcs/variable";
import UI from "../ui";
import Point, {LabelPosition} from "../../gcs/geometry/point";
import Line from "../../gcs/geometry/line";
import Circle from "../../gcs/geometry/circle";

export default class SelectedFigureWidget extends Widget {
    currentFigure: Figure;
    fields: HTMLInputElement[];
    variables: Variable[];

    constructor(ui: UI) {
        super(ui);
        this.fields = [];
        this.variables = [];
    }

    update() {
        let figures = this.ui.selectedFigures.elements;
        if(figures.length == 1) {
            if(this.currentFigure == figures[0]) {
                this.refreshValues();
            } else {
                this.initializeVariables(figures[0]);
                this.currentFigure = figures[0];
            }
            this.setVisible(true);
        } else {
            this.setVisible(false);
            this.currentFigure = null;
        }
    }

    refreshValues() {
        for(let i = 0; i < this.variables.length; i++) {
            this.fields[i].value = "" + this.variables[i].v;
        }
    }

    initializeVariables(figure: Figure) {
        this.fields = [];
        this.variables = [];
        while(this.div.lastChild) {
            this.div.removeChild(this.div.lastChild);
        }
        if (figure instanceof Point) {
            this.addVariable(figure._x, "x");
            this.addVariable(figure._y, "y");
            this.addLabelFields(figure);
        } else if (figure instanceof Line) {
            this.addVariable(figure.p0._x, "x1");
            this.addVariable(figure.p0._y, "y1");
            this.addVariable(figure.p1._x, "x2");
            this.addVariable(figure.p1._y, "y2");
        } else if (figure instanceof Circle) {
            this.addVariable(figure.c._x, "center x");
            this.addVariable(figure.c._y, "center y");
            this.addVariable(figure._r, "radius");
        }
    }

    addLabelFields(point: Point) {
        let div = document.createElement("div");

        let label = document.createElement("span");
        label.innerText = "Label:";
        div.appendChild(label);

        let field = document.createElement("input");
        field.type = "text";
        field.value = point.label ? point.label : "";

        let _this = this;
        field.onchange = function() {
            point.label = field.value;
            _this.ui.update();
            _this.ui.pushState();
        };
        div.appendChild(field);
        this.div.appendChild(div);

        let pdiv = document.createElement("div");
        let labelPosition = document.createElement("span");
        labelPosition.innerText = "LabelPosition:";
        pdiv.appendChild(labelPosition);

        let pfield = document.createElement("select");
        for(let t of ["center", "below", "above", "left", "right"]) {
            let po = document.createElement("option");
            po.value = t;
            po.innerText = t;
            pfield.appendChild(po);
        }
        pfield.value = point.labelPosition ? point.labelPosition : "";
        pfield.onchange = function() {
            point.labelPosition = pfield.value as LabelPosition;
            _this.ui.pushState();
            _this.ui.update();
        };
        pdiv.appendChild(pfield);
        this.div.appendChild(pdiv);
    }

    addVariable(variable: Variable, name: string) {
        let div = document.createElement("div");
        let label = document.createElement("span");
        label.innerText = name + ":";
        div.appendChild(label);
        let field = document.createElement("input");
        field.type = "number";
        field.step = "any";
        field.value = "" + variable.v;
        let _this = this;
        field.onchange = function() {
            variable.v = parseFloat(field.value);
            variable.constant = true;
            _this.ui.protractr.sketch.solveWithConstantFigures([], true);
            variable.constant = false;
            _this.ui.pushState();
            _this.ui.update();
        };
        div.appendChild(field);
        this.div.appendChild(div);
        this.fields.push(field);
        this.variables.push(variable);
    }
}