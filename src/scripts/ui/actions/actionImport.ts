/**
 * @module ui/actions
 */
/** */

import Action from "./action";
import IO from "../io/io";

export default class ActionImport extends Action {
    use() {
        let input = prompt("JSON or URL to import");
        if (input[0] == "{") {
            this.protractr.sketch = IO.DEFAULT_IMPORT.stringToSketch(input);
            this.protractr.ui.update();
        } else {
            this.protractr.loadFromURL(input);
        }
    }
}
