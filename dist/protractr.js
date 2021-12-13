"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module protractr
 */
/** */
var sketch_1 = require("./gcs/sketch");
var ui_1 = require("./ui/ui");
var io_1 = require("./ui/io/io");
var Protractr = /** @class */ (function () {
    function Protractr(canvas, sidePane, topBar) {
        this.sketch = new sketch_1.default();
        this.ui = new ui_1.default(this, canvas, sidePane, topBar);
    }
    Protractr.prototype.setSketch = function (sketch) {
        this.sketch = sketch;
        this.ui.selectedFigures.clear();
        this.ui.boldFigures.clear();
        this.ui.selectedRelations.clear();
        this.ui.update();
    };
    Protractr.prototype.loadFromURL = function (url) {
        var request = new XMLHttpRequest();
        var _this = this;
        request.addEventListener("load", function () {
            if (this.status == 200) {
                _this.setSketch(io_1.default.DEFAULT_IMPORT.stringToSketch(this.responseText));
            }
            else {
                console.log("Failed to load sketch, response code != 200: ", this);
            }
        });
        request.open("GET", url);
        request.send();
    };
    return Protractr;
}());
exports.default = Protractr;
//# sourceMappingURL=protractr.js.map