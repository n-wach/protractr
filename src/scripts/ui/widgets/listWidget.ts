import UI from "../ui";
import TitledWidget from "./titledWidget";
import Widget from "./widget";

export default abstract class ListWidget<T> extends TitledWidget {
    list: HTMLDivElement;
    values: T[] = [];
    elements: ListElement<T>[] = [];

    constructor(ui: UI) {
        super(ui);
        this.list = document.createElement("div");
        this.list.classList.add("interactive-list");
        this.div.appendChild(this.list);
    }

    abstract update();
    abstract getElementFromItem(item: T): ListElement<T>;

    setItems(items: T[]) {
        if(items.length == 0) {
            this.clear();
            return;
        }
        for(let value of this.values) {
            if(items.indexOf(value) === -1) {
                this.removeItem(value);
            }
        }
        for(let item of items) {
            if(this.values.indexOf(item) === -1) {
                this.addItem(item);
            }
        }
    }

    clear() {
        while(this.list.lastChild) {
            this.list.removeChild(this.list.lastChild);
        }
        this.list.style.display = "none";
        this.elements = [];
        this.values = [];
    }

    addItem(...items: T[]) {
        for(let item of items) {
            let element = this.getElementFromItem(item);
            this.list.appendChild(element.div);
            this.elements.push(element);
        }
        this.values.push(...items);
        if(items.length > 0) this.list.style.display = "block";
    }

    removeItem(...items: T[]) {
        for(let item of items) {
            let i = this.values.indexOf(item);
            if(i == -1) continue;
            this.list.removeChild(this.elements[i].div);
            this.elements.splice(i, 1);
            this.values.splice(i, 1);
        }
    }
}

export abstract class ListElement<T> extends Widget {
    spanName: HTMLSpanElement;
    actionButton: HTMLSpanElement;
    value: T;

    constructor(ui: UI, value: T, name: string, actionIcon?: string, actionTitle?: string) {
        super(ui);
        this.value = value;

        this.div.classList.add("interactive-list-element");
        this.div.addEventListener("mouseenter", this.onmouseenter.bind(this));
        this.div.addEventListener("mouseleave", this.onmouseleave.bind(this));
        this.div.addEventListener("mousedown", this.onmousedown.bind(this));

        this.spanName = document.createElement("span");
        this.spanName.innerText = name;
        this.spanName.classList.add("element-name");
        this.div.appendChild(this.spanName);

        if (actionIcon) {
            this.actionButton = document.createElement("span");
            this.actionButton.classList.add("action-button");
            this.actionButton.style.backgroundImage = "url('../image/" + actionIcon + "')";
            this.actionButton.addEventListener("mousedown", this.actionIconClicked.bind(this));
            if(actionTitle) this.actionButton.title = actionTitle;
            this.div.appendChild(this.actionButton);
        }
    }

    abstract onmouseenter(event);
    abstract onmouseleave(event);
    abstract onmousedown(event);
    abstract actionIconClicked(event);
}
