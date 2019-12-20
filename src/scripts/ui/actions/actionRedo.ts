/**
 * @module ui/actions
 */
/** */

import Action from "./action";

export default class ActionRedo extends Action {
    use() {
        this.protractr.loadSketch(this.protractr.ui.history.redo())
    }
}
