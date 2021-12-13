"use strict";
/**
 * @module gcs/io
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var json_1 = require("./json");
var latex_1 = require("./latex");
var IO = /** @class */ (function () {
    function IO() {
    }
    // for history
    IO.HISTORY_IMPORT = new json_1.JSONImporter();
    IO.HISTORY_EXPORT = new json_1.JSONExporter();
    // for actions
    IO.DEFAULT_IMPORT = new json_1.JSONImporter();
    IO.DEFAULT_EXPORT = new json_1.JSONExporter();
    //latex
    IO.LATEX_EXPORT = new latex_1.LatexExporter();
    return IO;
}());
exports.default = IO;
//# sourceMappingURL=io.js.map