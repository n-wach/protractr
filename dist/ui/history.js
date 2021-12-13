"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module ui/history
 */
/**
 * Editing history manager.  Consists of two stacks: undo and redo history.
 * New states clear redo history, are added to undo history.
 * It's possible for current state to be undefined, in which case the app should load some default state.
 */
var History = /** @class */ (function () {
    function History(startingState) {
        this.undoHistory = new HistoryStack();
        this.redoHistory = new HistoryStack();
        this.currentState = startingState;
    }
    /**
     * A new state produced by something other than undo or redo.
     */
    History.prototype.recordStateChange = function (newState) {
        if (this.currentState != newState) {
            this.undoHistory.push(this.currentState);
            this.redoHistory.clear();
            this.currentState = newState;
        }
    };
    /**
     * moves current state into redo, pops undo onto current state
     */
    History.prototype.undo = function () {
        if (this.undoHistory.empty())
            return this.currentState;
        this.redoHistory.push(this.currentState);
        this.currentState = this.undoHistory.pop();
        return this.currentState;
    };
    /**
     * moves current state into undo, pops redo onto current state
     */
    History.prototype.redo = function () {
        if (this.redoHistory.empty())
            return this.currentState;
        this.undoHistory.push(this.currentState);
        this.currentState = this.redoHistory.pop();
        return this.currentState;
    };
    return History;
}());
exports.default = History;
/**
 * Simple stack structure.  Adjacent elements must be distinct.
 */
var HistoryStack = /** @class */ (function () {
    function HistoryStack() {
        this.stack = [];
    }
    /**
     * Get top element of stack
     */
    HistoryStack.prototype.top = function () {
        if (this.empty())
            return undefined;
        return this.stack[this.stack.length - 1];
    };
    HistoryStack.prototype.push = function (element) {
        if (this.top() != element) {
            this.stack.push(element);
        }
    };
    /**
     * Get top element of stack and remove
     */
    HistoryStack.prototype.pop = function () {
        if (this.empty())
            return undefined;
        return this.stack.pop();
    };
    HistoryStack.prototype.empty = function () {
        return this.stack.length == 0;
    };
    HistoryStack.prototype.clear = function () {
        this.stack = [];
    };
    return HistoryStack;
}());
//# sourceMappingURL=history.js.map