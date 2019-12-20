/**
 * @module ui/actions
 */
/** */

import Action from "./action";

export default class ActionImport extends Action {
    use() {
        let input = prompt("JSON or URL to import");
        if (input[0] == "{") {
            this.protractr.loadSketch(input);
        } else {
            this.protractr.loadFromURL(input);
        }
    }
}
