/**
 * @module gcs/filterString
 */
/** */

import {Figure} from "./figures";

type MatchQuantifier = string;
type FigureType = string;
type TypeMatch = { quantifier: MatchQuantifier, type: FigureType };
type TypeMatchExpression = TypeMatch[];
type TypeMatchExpressionList = TypeMatchExpression[];
type TypeMap = { from: FigureType, count: number, to: FigureType };
type TypeMapList = TypeMap[];
type FilterCase = { mappings: TypeMapList, expressions: TypeMatchExpressionList };
type Filter = FilterCase[];

/**
 * See type definitions
 * - TypeMatches are joined by & to form a TypeMatchExpression
 * - TypeMaps take the form "type as n type" such as "line as 2 point"
 * - TypeMaps are joined by , to form a TypeMapList
 * - MappedTypedMatchExpressionLists are formed as TypeMapList:TypeMatchExpression
 * - MappedTypedMatchExpressionLists are joined by | to form
 * - MatchQuantifier can be a number, a range (number-number), number+ or * (0+) or empty (1)
 */
export default class FilterString {
    filterString: string;
    filter: Filter;

    constructor(str: string) {
        this.filterString = str;
        this.filter = this.parseFilter(this.filterString);
    }

    private parseFilter(filterString: string): Filter {
        let filter: Filter = [];
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
            if (typeMatch[i].toLowerCase() != typeMatch[i].toUpperCase()) {
                //we've hit a letter!
                let quantifier = typeMatch.substr(0, i);
                if (quantifier == "*") quantifier = "0+";
                if (quantifier == "" || quantifier == undefined) quantifier = "1";
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
            if (rawTypes[fig.type] === undefined) {
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
            if (this.satisfiesFilterCase(filterCase, typeCopy)) return true;
        }
        return false;
    }

    private satisfiesFilterCase(filterCase: FilterCase, types): boolean {
        for(let typeMapping of filterCase.mappings) {
            this.mapTypes(typeMapping, types);
        }
        for(let expression of filterCase.expressions) {
            if (this.satisfiesTypeMatchExpression(expression, types)) return true;
        }
        return false;
    }

    private mapTypes(typeMapping: TypeMap, types) {
        if (types[typeMapping.from] !== undefined) {
            let additionalTypes = types[typeMapping.from] * typeMapping.count;
            delete types[typeMapping.from];
            if (types[typeMapping.to] === undefined) {
                types[typeMapping.to] = additionalTypes;
            } else {
                types[typeMapping.to] += additionalTypes;
            }
        }
    }

    private satisfiesTypeMatchExpression(expression: TypeMatchExpression, types): boolean {
        let addressedTypes = {};
        for(let typeMatch of expression) {
            if (!this.satisfiesTypeMatch(typeMatch, types)) return false;
            addressedTypes[typeMatch.type] = true;
        }
        for(let type in types) {
            //all types must be addressed.
            if (!addressedTypes[type]) return false;
        }
        return true;
    }

    private satisfiesTypeMatch(typeMatch: TypeMatch, types): boolean {
        let count = types[typeMatch.type];
        let quantifier = typeMatch.quantifier;
        if (quantifier.indexOf("-") != -1) {
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