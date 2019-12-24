/**
 * @module ui/widgets
 */
/** */
import ListWidget, {ListElement} from "./listWidget";
import Relation from "../../gcs/relations/relation";

export default class RelationListWidget extends ListWidget<Relation> {
    update() {
        let figures = this.ui.selectedFigures.elements;
        if(figures.length == 0) {
            let relations = this.ui.protractr.sketch.relationManager.relations;
            if (relations.length == 0) {
                this.setTitle("No relations in sketch");
            }  else {
                this.setTitle("Sketch relations: ");
            }
            this.setItems(relations);
        } else {
            let relations = [...this.ui.protractr.sketch.relationManager.relations];
            for(let figure of figures) {
                for(let relation of relations) {
                    // only display relations that contain all selected figures...
                    // that means remove any relation that doesn't contain any 1 selected figure
                    if(!relation.containsFigure(figure)) {
                        let i = relations.indexOf(relation);
                        relations.splice(i, 1);
                    }
                }
            }
            if(relations.length == 0) {
                if (figures.length == 1) {
                    this.setTitle("No relations on selected figure");
                } else {
                    this.setTitle("No relations exist between the selected figures");
                }
            } else {
                if (figures.length == 1) {
                    this.setTitle("Figure relations:");
                } else {
                    this.setTitle("Selection relations:");
                }
            }
            this.setItems(relations);
        }
    }

    getElementFromItem(item: Relation): ListElement<Relation> {
        return new RelationElement(this.ui, item, item.name, "delete.png", "Delete relation");
    }

}

class RelationElement extends ListElement<Relation> {
    actionIconClicked(event) {
        this.ui.protractr.sketch.relationManager.removeRelations(this.value);
        this.ui.selectedRelations.remove(this.value);
        this.ui.update();
        event.stopPropagation();
        return false;
    }

    onmousedown(event) {
    }

    onmouseenter(event) {
        this.ui.selectedRelations.add(this.value);
        this.ui.update();
    }
    onmouseleave(event) {
        this.ui.selectedRelations.remove(this.value);
        this.ui.update();
    }
}
