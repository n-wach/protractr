/**
 * @module gcs/relations
 */
/** */

import Relation from "./relation";
import Variable from "../variable";

/**
 * Used to set multiple variables equal.  For instance,
 * horizontal/vertical points, or equal radius circles.
 * WARNING: this relation is unique in that it immediately links
 * variables and becomes active.  It does not need to be added to
 * a sketch to take affect...
 */
export default class RelationEqual extends Relation {
    variables: Variable[];

    constructor(name: string, ...variables: Variable[]) {
        super(name);
        this.variables = variables;
        let root = this.variables[0];
        for(let i = 1; i < this.variables.length; i++) {
            this.variables[i].linkValues(root);
        }
    }

    getDeltas(): [Variable, number][] {
        return [];
    }

    getError(): number {
        return 0;
    }

    getVariables(): Variable[] {
        return this.variables;
    }

    remove() {
        for(let variable of this.variables) {
            variable.unlink();
        }
    }
}