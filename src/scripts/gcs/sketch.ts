/**
 * @module gcs/sketch
 */
/** */
import Point from "./geometry/point";
import RelationManager from "./relations/manager";
import Figure from "./geometry/figure";
import Util from "./geometry/util";
import RelationPointsOnCircle from "./relations/relationPointsOnCircle";
import Arc from "./geometry/arc";

export default class Sketch {
    figures: Figure[];
    relationManager: RelationManager;

    constructor() {
        this.figures = [];
        this.relationManager = new RelationManager();
    }

    getClosestFigure(point: Point, scale: number=1, maxDist: number=10): Figure {
        let allFigures = [];
        for(let fig of this.figures) {
            allFigures.push(fig);
            allFigures.push(...fig.getChildFigures());
        }

        let closestDist = 0;
        let closest = null;

        for(let fig of allFigures) {
            let p = fig.getClosestPoint(point);
            let dist = Util.distanceBetweenPoints(p, point);
            if(fig instanceof Point) {
                dist -= 5 / scale; // make it easier to be closest to a point
            }
            if (dist < closestDist || closest == null) {
                closest = fig;
                closestDist = dist;
            }
        }

        if (closestDist > maxDist / scale) return null;
        return closest;
    }

    solveWithConstantFigures(figures: Figure[], tireless: boolean=false) {
        for(let fig of figures) {
            fig.constant = true;
        }
        this.relationManager.solveRelations(tireless);
        for(let fig of figures) {
            fig.constant = false;
        }
        if(tireless && !this.relationManager.isSolved()) {
            alert("That state couldn't be solved...");
        }
    }

    addFigure(figure: Figure) {
        if(this.figures.indexOf(figure) != -1) return;
        if(figure instanceof Arc) {
            let relation = new RelationPointsOnCircle(figure, figure.p0, figure.p1);
            this.relationManager.addRelations(relation);
        }
        this.figures.push(figure);
    }

    addFigures(...figures: Figure[]) {
        for(let figure of figures) {
            this.addFigure(figure);
        }
    }
}

