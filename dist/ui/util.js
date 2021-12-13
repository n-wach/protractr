"use strict";
/**
 * @module ui/util
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
function saveAs(string, filename) {
    var a = document.createElement("a");
    var data = "text/json;charset=utf-8," + encodeURIComponent(string);
    a.href = "data:" + data;
    a.download = filename;
    a.click();
}
exports.saveAs = saveAs;
//# sourceMappingURL=util.js.map