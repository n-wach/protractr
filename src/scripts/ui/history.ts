
/**
 * Editing history manager.  Consists of two stacks: undo and redo history.
 * New states clear redo history, are added to undo history.
 * It's possible for current state to be undefined, in which case the app should load some default state.
 */
export class History<T=string> {
    undoHistory: HistoryStack<T>;
    redoHistory: HistoryStack<T>;
    currentState: T;
    constructor(startingState: T) {
        this.undoHistory = new HistoryStack<T>();
        this.redoHistory = new HistoryStack<T>();
        this.currentState = startingState;
    }
    /**
     * A new state produced by something other than undo or redo.
     */
    recordStateChange(newState: T) {
        if(this.currentState != newState) {
            this.undoHistory.push(this.currentState);
            this.redoHistory.clear();
            this.currentState = newState;
        }
    }
    /**
     * moves current state into redo, pops undo onto current state
     */
    undo(): T {
        if(this.undoHistory.empty()) return this.currentState;

        this.redoHistory.push(this.currentState);
        this.currentState = this.undoHistory.pop();
        return this.currentState;
    }
    /**
     * moves current state into undo, pops redo onto current state
     */
    redo(): T {
        if(this.redoHistory.empty()) return this.currentState;

        this.undoHistory.push(this.currentState);
        this.currentState = this.redoHistory.pop();
        return this.currentState;
    }
}

/**
 * Simple stack structure.  Adjacent elements must be distinct.
 */
class HistoryStack<T> {
    stack: T[];
    constructor() {
        this.stack = [];
    }
    /**
     * Get top element of stack
     */
    top(): T {
        if(this.empty()) return undefined;
        return this.stack[this.stack.length - 1];
    }
    push(element: T) {
        if(this.top() != element) {
            this.stack.push(element);
        }
    }
    /**
     * Get top element of stack and remove
     */
    pop(): T {
        if(this.empty()) return undefined;
        return this.stack.pop();
    }
    empty(): boolean {
        return this.stack.length == 0;
    }
    clear() {
        this.stack = [];
    }
}