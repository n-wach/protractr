/**
 * @module ui/actions
 */
/** */

import Action from "./action";
import {saveAs} from "../util";
import IO from "../io/io";

export default class ActionExport extends Action {
    use() {
        saveAs(IO.DEFAULT_EXPORT.sketchToString(this.protractr.sketch), IO.DEFAULT_EXPORT.getFilename());
    }
}
