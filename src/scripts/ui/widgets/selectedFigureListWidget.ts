/**
 * @module ui/widgets
 */
/** */

import Figure from "../../gcs/geometry/figure";
import ListWidget, {ListElement} from "./listWidget";
import {getFigureTypeString} from "../../gcs/filterString";

export default class SelectedFigureListWidget extends ListWidget<Figure> {
    update() {
        let figures = this.ui.selectedFigures.elements;
        if (figures.length == 0) {
            this.setVisible(false);
        } else if (figures.length == 1) {
            this.setVisible(true);
            this.setTitle("Selected Figure:");
        } else {
            this.setVisible(true);
            this.setTitle("Selected Figures:");
        }
        this.setItems(figures);
    }

    getElementFromItem(item: Figure): ListElement<Figure> {
        return new SelectedFigureElement(this.ui, item, getFigureTypeString(item), "delete.png", "Remove from selection");
    }
}

class SelectedFigureElement extends ListElement<Figure> {
    actionIconClicked(event) {
        this.ui.selectedFigures.remove(this.value);
        this.ui.boldFigures.remove(this.value);
        this.ui.update();
        event.stopPropagation();
        return false;
    }
    onmousedown(event) {
        this.ui.selectedFigures.set(this.value);
        this.ui.update();
    }
    onmouseenter(event) {
        this.ui.boldFigures.add(this.value);
        this.ui.update();
    }
    onmouseleave(event) {
        this.ui.boldFigures.remove(this.value);
        this.ui.update();
    }
}