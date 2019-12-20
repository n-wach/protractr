/**
 * @module ui/actions
 */
/** */

import Action from "./action";
import {saveAs} from "../util";

export default class ActionExport extends Action {
    use() {
        saveAs(this.protractr.exportSketch(), "sketch.json");
    }
}
