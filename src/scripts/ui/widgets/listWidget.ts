import UI from "../ui";
import TitledWidget from "./titledWidget";
import Widget from "./widget";

export default abstract class ListWidget<T> extends TitledWidget {
    list: HTMLDivElement;

    constructor(ui: UI) {
        super(ui);
        this.list = document.createElement("div");
        this.list.classList.add("interactive-list");
        this.div.appendChild(this.list);
    }

    abstract update();
    abstract getElementFromItem(item: T): ListElement<T>;

    setItems(items: T[]) {
        this.clear();
        this.addItem(...items);
    }

    clear() {
        while(this.list.lastChild) {
            this.list.removeChild(this.list.lastChild);
        }
        this.list.style.display = "none";
    }

    addItem(...items: T[]) {
        for(let item of items) {
            let element = this.getElementFromItem(item);
            this.list.appendChild(element.div);
        }
        if(items.length > 0) this.list.style.display = "block";
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
            this.actionButton.style.backgroundImage = "url('../../image/" + actionIcon + "')";
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
