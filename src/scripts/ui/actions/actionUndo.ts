/**
 * @module ui/actions
 */
/** */

import Action from "./action";

export default class ActionUndo extends Action {
    use() {
        this.protractr.ui.restoreState(this.protractr.ui.history.undo())
    }
}
