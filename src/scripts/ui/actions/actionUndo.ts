/**
 * @module ui/actions
 */
/** */

import Action from "./action";

export default class ActionUndo extends Action {
    use() {
        this.protractr.loadSketch(this.protractr.ui.history.undo())
    }
}
