"use strict";
/**
 * @module ui
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var sidePanel_1 = require("./widgets/sidePanel");
var sketchview_1 = require("./sketchview");
var history_1 = require("./history");
var topbar_1 = require("./topbar");
var container_1 = require("./container");
var io_1 = require("./io/io");
var UI = /** @class */ (function () {
    function UI(protractr, canvas, sidePane, topBar) {
        this.protractr = protractr;
        this.history = new history_1.default(io_1.default.HISTORY_EXPORT.sketchToString(protractr.sketch));
        this.sketchView = new sketchview_1.default(this, canvas);
        this.sidePanel = new sidePanel_1.default(this, sidePane);
        this.topBar = new topbar_1.default(protractr, topBar);
        this.selectedFigures = new container_1.default([], this.update.bind(this));
        this.boldFigures = new container_1.default([], this.update.bind(this));
        this.selectedRelations = new container_1.default([], this.update.bind(this));
        this.update();
    }
    UI.prototype.pushState = function () {
        var e = io_1.default.HISTORY_EXPORT.sketchToString(this.protractr.sketch);
        this.history.recordStateChange(e);
    };
    UI.prototype.restoreState = function (state) {
        this.protractr.setSketch(io_1.default.DEFAULT_IMPORT.stringToSketch(state));
    };
    UI.prototype.update = function () {
        this.sidePanel.update();
        this.sketchView.draw();
    };
    return UI;
}());
exports.default = UI;
//# sourceMappingURL=ui.js.map