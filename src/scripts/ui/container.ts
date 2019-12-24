export default class Container<T> {
    elements: T[];
    updateCallback: Function;

    constructor(elements: T[], updateCallback?: Function) {
        this.elements = elements;
        this.updateCallback = updateCallback;
    }
    update() {
        if(this.updateCallback) this.updateCallback();
    }
    add(...elements: T[]) {
        this.elements.push(...elements);
        this.update();
    }
    remove(...elements: T[]) {
        for(let e of elements) {
            let i = this.elements.indexOf(e);
            if(i === -1) continue;
            this.elements.splice(i, 1);
        }
        this.update();
    }
    contains(element: T) {
        return this.elements.indexOf(element) !== -1;
    }
    togglePresence(element: T) {
        if(this.contains(element)) {
            this.remove(element);
        } else {
            this.add(element);
        }
    }
    set(...elements: T[]) {
        this.elements = elements;
        this.update();
    }
    clear() {
        this.elements = [];
        this.update();
    }
}
