import {CircleFigure, Figure, LineFigure, PointFigure} from "./figures";
import {
    Constraint,
    CoincidentPointConstraint,
    VerticalConstraint,
    HorizontalConstraint,
    LineMidpointConstraint,
    ArcPointCoincidentConstraint,
    VariablePoint,
    EqualConstraint,
    ColinearPointsConstraint, Variable, TangentLineConstraint, TangentCircleConstraint,
} from "./constraint";

type MatchQuantifier = string;
type FigureType = string;
type TypeMatch = {quantifier: MatchQuantifier, type: FigureType};
type TypeMatchExpression = TypeMatch[];
type TypeMatchExpressionList = TypeMatchExpression[];
type TypeMap = {from: FigureType, count: number, to: FigureType};
type TypeMapList = TypeMap[];
type FilterCase = {mappings: TypeMapList, expressions: TypeMatchExpressionList};
type Filter = FilterCase[];


class FilterString {
    /**
     * See type definitions above.
     * - TypeMatches are joined by & to form a TypeMatchExpression
     * - TypeMaps take the form "type as n type" such as "line as 2 point"
     * - TypeMaps are joined by , to form a TypeMapList
     * - MappedTypedMatchExpressionLists are formed as TypeMapList:TypeMatchExpression
     * - MappedTypedMatchExpressionLists are joined by | to form
     * - MatchQuantifier can be a number, a range (number-number), number+ or * (0+) or empty (1)
     */
    filterString: string;
    filter: Filter;
    constructor(str: string) {
        this.filterString = str;
        this.filter = this.parseFilter(this.filterString);
    }
    private parseFilter(filterString: string): Filter{
        let filter: Filter=[];
        for(let mappedTypeMatchExpressionList of filterString.split("|")) {
            filter.push(this.parseFilterCase(mappedTypeMatchExpressionList));
        }
        return filter;
    }
    private parseFilterCase(filterCase: string): FilterCase {
        let split = filterCase.split(":");
        let mapList: TypeMapList = split[0] ? this.parseTypeMapList(split[0]) : [];
        let matchExpressionList: TypeMatchExpressionList = this.parseTypeMatchExpressionList(split[1]);
        return {mappings: mapList, expressions: matchExpressionList};
    }
    private parseTypeMapList(typeMapList: string): TypeMapList {
        let maps: TypeMapList = [];
        for(let typeMap of typeMapList.split(",")) {
            maps.push(this.parseTypeMap(typeMap));
        }
        return maps;
    }
    private parseTypeMap(typeMap: string): TypeMap {
        let split = typeMap.split(" ");
        let fromType = split[0];
        //let as = split[1];
        let toTypeCount = parseInt(split[2]);
        let toType = split[3];
        return {from: fromType, count: toTypeCount, to: toType};
    }
    private parseTypeMatchExpressionList(typeMatchExpressionList: string): TypeMatchExpressionList {
        let expressions: TypeMatchExpressionList = [];
        for(let typeMatchExpression of typeMatchExpressionList.split(",")) {
            expressions.push(this.parseTypeMatchExpression(typeMatchExpression));
        }
        return expressions;
    }
    private parseTypeMatchExpression(typeMatchExpression: string): TypeMatchExpression {
        let matches: TypeMatchExpression = [];
        for(let typeMatch of typeMatchExpression.split("&")) {
            matches.push(this.parseTypeMatch(typeMatch));
        }
        return matches;
    }
    private parseTypeMatch(typeMatch: string): TypeMatch {
        for(let i = 0; i < typeMatch.length; i++) {
            if(typeMatch[i].toLowerCase() != typeMatch[i].toUpperCase()) {
                //we've hit a letter!
                let quantifier = typeMatch.substr(0, i);
                if(quantifier == "*") quantifier = "0+";
                if(quantifier == "" || quantifier == undefined) quantifier = "1";
                let type = typeMatch.substr(i);
                return {quantifier: quantifier, type: type};
            }
        }
        console.error("Invalid TypeMatch:", typeMatch);
        return {quantifier: "0", type: "point"};
    }
    satisfiesFilter(figures: Figure[]) {
        let rawTypes = {};
        for(let fig of figures) {
            if(rawTypes[fig.type] === undefined) {
                rawTypes[fig.type] = 1;
                continue;
            }
            rawTypes[fig.type] += 1;
        }
        for(let filterCase of this.filter) {
            let typeCopy = {};
            for(let key in rawTypes) {
                typeCopy[key] = rawTypes[key];
            }
            if(this.satisfiesFilterCase(filterCase, typeCopy)) return true;
        }
        return false;
    }
    private satisfiesFilterCase(filterCase: FilterCase, types): boolean {
        for(let typeMapping of filterCase.mappings) {
            this.mapTypes(typeMapping, types);
        }
        for(let expression of filterCase.expressions) {
            console.log(types, expression);
            if(this.satisfiesTypeMatchExpression(expression, types)) return true;
        }
        return false;
    }
    private mapTypes(typeMapping: TypeMap, types) {
        if(types[typeMapping.from] !== undefined) {
            let additionalTypes = types[typeMapping.from] * typeMapping.count;
            types[typeMapping.from] = 0;
            if(types[typeMapping.to] === undefined) {
                types[typeMapping.to] = additionalTypes;
            } else {
                types[typeMapping.to] += additionalTypes;
            }
        }
    }
    private satisfiesTypeMatchExpression(expression: TypeMatchExpression, types): boolean {
        let addressedTypes = {};
        for(let typeMatch of expression) {
            if(!this.satisfiesTypeMatch(typeMatch, types)) return false;
            addressedTypes[typeMatch.type] = true;
        }
        for(let type in types) {
            //all types must be addressed.
            if(!addressedTypes[type]) return false;
        }
        return true;
    }
    private satisfiesTypeMatch(typeMatch: TypeMatch, types): boolean {
        let count = types[typeMatch.type];
        let quantifier = typeMatch.quantifier;
        if(quantifier.indexOf("-") != -1) {
            //range
            let min = parseInt(quantifier.substr(0, quantifier.indexOf("-") - 1));
            let max = parseInt(quantifier.substr(quantifier.indexOf("-") + 1));
            return count >= min && count <= max;
        }
        if (quantifier.indexOf("+") != -1) {
            //min+
            let min = parseInt(quantifier.substr(0, quantifier.indexOf("+")));
            return count >= min;
        }
        let exact = parseInt(quantifier);
        return count == exact;
    }
}

interface ConstraintFilter {
    name: string;
    filter: FilterString;
    createConstraints(figs: Figure[]): Constraint[];
}

class HorizontalPointFilter implements ConstraintFilter {
    name: string = "horizontal";
    filter = new FilterString(":2+point");
    createConstraints(figs: Figure[]) {
        let points = [];
        for(let fig of figs as PointFigure[]) {
            points.push(fig.p.variablePoint);
        }
        return [new HorizontalConstraint(points)];
    }
}

class VerticalPointFilter implements ConstraintFilter {
    name: string = "vertical";
    filter = new FilterString(":2+point");
    createConstraints(figs: Figure[]) {
        let points = [];
        for(let fig of figs as PointFigure[]) {
            points.push(fig.p.variablePoint);
        }
        return [new VerticalConstraint(points)];
    }
}

class VerticalLineFilter implements ConstraintFilter {
    name: string = "vertical";
    filter = new FilterString(":1+line");
    createConstraints(figs: Figure[]) {
        let constraints = [];
        for(let line of figs as LineFigure[]) {
            constraints.push(new VerticalConstraint([line.p1.variablePoint, line.p2.variablePoint]));
        }
        return constraints;
    }
}

class HorizontalLineFilter implements ConstraintFilter {
    name: string = "horizontal";
    filter = new FilterString(":1+line");
    createConstraints(figs: Figure[]) {
        let constraints = [];
        for(let line of figs as LineFigure[]) {
            constraints.push(new HorizontalConstraint([line.p1.variablePoint, line.p2.variablePoint]));
        }
        return constraints;
    }
}

class CoincidentPointFilter implements ConstraintFilter {
    name: string = "coincident";
    filter = new FilterString(":2+point");
    createConstraints(figs: Figure[]) {
        let points = [];
        for(let fig of figs as PointFigure[]) {
            points.push(fig.p.variablePoint);
        }
        return [new CoincidentPointConstraint(points)];
    }
}

class ArcPointCoincidentFilter implements ConstraintFilter {
    name: string = "coincident";
    filter = new FilterString(":circle&1+point");
    createConstraints(figs: Figure[]) {
        let points: VariablePoint[] = [];
        let circle: CircleFigure = null;
        for(let fig of figs) {
            if(fig.type == "point") {
                points.push((fig as PointFigure).p.variablePoint);
            } else if(fig.type == "circle") {
                circle = fig as CircleFigure;
            }
        }
        return [new ArcPointCoincidentConstraint(circle.c.variablePoint, circle.r, points)];
    }
}

class LineMidpointCoincidentFilter implements ConstraintFilter {
    name: string = "midpoint";
    filter = new FilterString(":line&point");
    createConstraints(figs: Figure[]) {
        let point: PointFigure = null;
        let line: LineFigure = null;
        for(let fig of figs) {
            if(fig.type == "point") {
                point = fig as PointFigure;
            } else if(fig.type == "line") {
                line = fig as LineFigure;
            }
        }
        return [new LineMidpointConstraint(line.p1.variablePoint, line.p2.variablePoint, point.p.variablePoint)];
    }
}

class EqualRadiusConstraintFilter implements ConstraintFilter {
    name: string = "equal";
    filter = new FilterString(":2+circle");
    createConstraints(figs: Figure[]): Constraint[] {
        let radii = [];
        for(let fig of figs as CircleFigure[]) {
            radii.push(fig.r);
        }
        return [new EqualConstraint(radii)];
    }
}

class ColinearConstraintFilter implements ConstraintFilter {
    name: string = "colinear";
    filter = new FilterString("line as 2 point:2+point");
    createConstraints(figs: Figure[]): Constraint[] {
        let points: VariablePoint[] = [];
        for(let fig of figs) {
            if(fig.type == "point") {
                points.push((fig as PointFigure).p.variablePoint);
            } else if(fig.type == "line") {
                points.push((fig as LineFigure).p1.variablePoint);
                points.push((fig as LineFigure).p2.variablePoint);
            }
        }
        return [new ColinearPointsConstraint(points)];
    }
}

export class TangentLineConstraintFilter implements ConstraintFilter {
    name: string = "tangent";
    filter = new FilterString(":circle&1+line");
    createConstraints(figs: Figure[]): Constraint[] {
        let circle: CircleFigure = null;
        let lines: LineFigure[] = [];
        for(let fig of figs) {
            if(fig.type == "circle") {
                circle = fig as CircleFigure;
            } else if(fig.type == "line") {
                lines.push(fig as LineFigure);
            }
        }
        let constraints = [];
        for(let line of lines) {
            constraints.push(new TangentLineConstraint(circle.c.variablePoint, circle.r, line.p1.variablePoint, line.p2.variablePoint));
        }
        return constraints;
    }
}

export class ConcentricConstraintFilter implements ConstraintFilter {
    name: string = "concentric";
    filter = new FilterString(":circle&1+line");
    createConstraints(figs: Figure[]): Constraint[] {
        let points = [];
        for(let fig of figs) {
            if(fig.type == "circle") {
                points.push((fig as CircleFigure).c.variablePoint);
            } else if(fig.type == "point") {
                points.push((fig as PointFigure).p.variablePoint);
            }
        }
        return [new CoincidentPointConstraint(points)];
    }
}

export class IntersectionConstraintFilter implements ConstraintFilter {
    name: string = "intersection";
    filter = new FilterString(":point&2+line");
    createConstraints(figs: Figure[]): Constraint[] {
        let lines: LineFigure[] = [];
        let point: VariablePoint = null;
        for(let fig of figs) {
            if(fig.type == "point") {
                point = (fig as PointFigure).p.variablePoint;
            } else if(fig.type == "line") {
                lines.push(fig as LineFigure);
            }
        }
        let constraints = [];
        for(let line of lines) {
            constraints.push(new ColinearPointsConstraint([line.p1.variablePoint, line.p2.variablePoint, point]));
        }
        return constraints;
    }
}

export class TangentCirclesConstraintFilter implements ConstraintFilter {
    name: string = "tangent";
    filter = new FilterString(":2circle");
    createConstraints(figs: Figure[]): Constraint[] {
        let circle1 = figs[0] as CircleFigure;
        let circle2 = figs[1] as CircleFigure;
        return [new TangentCircleConstraint(circle1.c.variablePoint, circle1.r, circle2.c.variablePoint, circle2.r)];
    }
}

let possibleConstraints = [
    new CoincidentPointFilter(),
    new HorizontalPointFilter(),
    new HorizontalLineFilter(),
    new VerticalPointFilter(),
    new VerticalLineFilter(),
    new ArcPointCoincidentFilter(),
    new LineMidpointCoincidentFilter(),
    new EqualRadiusConstraintFilter(),
    new ColinearConstraintFilter(),
    new TangentLineConstraintFilter(),
    new ConcentricConstraintFilter(),
    new IntersectionConstraintFilter(),
    new TangentCirclesConstraintFilter(),
];

export function getSatisfiedConstraintFilters(figs: Figure[]): ConstraintFilter[] {
    let possibilities = [];
    for(let pc of possibleConstraints) {
        if(pc.filter.satisfiesFilter(figs)) possibilities.push(pc);
    }
    return possibilities;
}

