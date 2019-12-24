import Widget from "./widget";
import UI from "../ui";

export default class TitledWidget extends Widget {
    title: HTMLParagraphElement;

    constructor(ui: UI) {
        super(ui);
        this.title = document.createElement("p");
        this.div.appendChild(this.title);
    }
    setTitle(title: string) {
        this.title.innerText = title;
    }
}