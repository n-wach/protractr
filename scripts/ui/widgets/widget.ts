/**
 * @module ui/widgets
 */
/** */
import UI from "../ui";

export default class Widget {
    div: HTMLDivElement;
    children: Widget[];
    ui: UI;

    constructor(ui: UI, div?: HTMLDivElement) {
        this.ui = ui;
        if(div) {
            this.div = div;
        } else {
            this.div = document.createElement("div");
        }
        this.children = [];
    }

    setVisible(visible: boolean) {
        this.div.style.display = visible ? "block" : "none";
    }

    addWidget(widget: Widget) {
        this.div.appendChild(widget.div);
        this.children.push(widget);
    }

    update() {
        for(let child of this.children) {
            child.update();
        }
    }
}
