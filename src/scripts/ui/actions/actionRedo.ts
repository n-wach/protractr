/**
 * @module ui/actions
 */
/** */

import Action from "./action";

export default class ActionRedo extends Action {
    use() {
        this.protractr.ui.restoreState(this.protractr.ui.history.redo())
    }
}
