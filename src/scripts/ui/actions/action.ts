import {Protractr} from "../../protractr";

export default abstract class Action {
    protractr: Protractr;

    constructor(protractr: Protractr) {
        this.protractr = protractr;
    }

    abstract use();
}
