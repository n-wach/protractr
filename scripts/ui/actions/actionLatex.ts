/**
 * @module ui/actions
 */
/** */

import Action from "./action";
import {saveAs} from "../util";
import IO from "../io/io";

export default class ActionLatex extends Action {
    use() {
        let latex = IO.LATEX_EXPORT.sketchToString(this.protractr.sketch);
        navigator.clipboard.writeText(latex)
            .then(() => {
                alert("LaTeX copied to clipboard");
            })
            .catch(() => {
                saveAs(latex, IO.LATEX_EXPORT.getFilename());
            });
    }
}



