"use strict";
/**
 * @module gcs/filterString
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var circle_1 = require("./geometry/circle");
var line_1 = require("./geometry/line");
var point_1 = require("./geometry/point");
/**
 * See type definitions
 * - TypeMatches are joined by & to form a TypeMatchExpression
 * - TypeMaps take the form "type as n type" such as "line as 2 point"
 * - TypeMaps are joined by , to form a TypeMapList
 * - MappedTypedMatchExpressionLists are formed as TypeMapList:TypeMatchExpression
 * - MappedTypedMatchExpressionLists are joined by | to form
 * - MatchQuantifier can be a number, a range (number-number), number+ or * (0+) or empty (1)
 */
var FilterString = /** @class */ (function () {
    function FilterString(str) {
        this.filterString = str;
        this.filter = this.parseFilter(this.filterString);
    }
    FilterString.prototype.parseFilter = function (filterString) {
        var filter = [];
        for (var _i = 0, _a = filterString.split("|"); _i < _a.length; _i++) {
            var mappedTypeMatchExpressionList = _a[_i];
            filter.push(this.parseFilterCase(mappedTypeMatchExpressionList));
        }
        return filter;
    };
    FilterString.prototype.parseFilterCase = function (filterCase) {
        var split = filterCase.split(":");
        var mapList = split[0] ? this.parseTypeMapList(split[0]) : [];
        var matchExpressionList = this.parseTypeMatchExpressionList(split[1]);
        return { mappings: mapList, expressions: matchExpressionList };
    };
    FilterString.prototype.parseTypeMapList = function (typeMapList) {
        var maps = [];
        for (var _i = 0, _a = typeMapList.split(","); _i < _a.length; _i++) {
            var typeMap = _a[_i];
            maps.push(this.parseTypeMap(typeMap));
        }
        return maps;
    };
    FilterString.prototype.parseTypeMap = function (typeMap) {
        var split = typeMap.split(" ");
        var fromType = split[0];
        //let as = split[1];
        var toTypeCount = parseInt(split[2]);
        var toType = split[3];
        return { from: fromType, count: toTypeCount, to: toType };
    };
    FilterString.prototype.parseTypeMatchExpressionList = function (typeMatchExpressionList) {
        var expressions = [];
        for (var _i = 0, _a = typeMatchExpressionList.split(","); _i < _a.length; _i++) {
            var typeMatchExpression = _a[_i];
            expressions.push(this.parseTypeMatchExpression(typeMatchExpression));
        }
        return expressions;
    };
    FilterString.prototype.parseTypeMatchExpression = function (typeMatchExpression) {
        var matches = [];
        for (var _i = 0, _a = typeMatchExpression.split("&"); _i < _a.length; _i++) {
            var typeMatch = _a[_i];
            matches.push(this.parseTypeMatch(typeMatch));
        }
        return matches;
    };
    FilterString.prototype.parseTypeMatch = function (typeMatch) {
        for (var i = 0; i < typeMatch.length; i++) {
            if (typeMatch[i].toLowerCase() != typeMatch[i].toUpperCase()) {
                //we've hit a letter!
                var quantifier = typeMatch.substr(0, i);
                if (quantifier == "*")
                    quantifier = "0+";
                if (quantifier == "" || quantifier == undefined)
                    quantifier = "1";
                var type = typeMatch.substr(i);
                return { quantifier: quantifier, type: type };
            }
        }
        console.error("Invalid TypeMatch:", typeMatch);
        return { quantifier: "0", type: "point" };
    };
    FilterString.prototype.satisfiesFilter = function (figures) {
        var rawTypes = {};
        for (var _i = 0, figures_1 = figures; _i < figures_1.length; _i++) {
            var fig = figures_1[_i];
            var type = getFigureTypeString(fig);
            if (rawTypes[type] === undefined) {
                rawTypes[type] = 1;
            }
            else {
                rawTypes[type] += 1;
            }
        }
        for (var _a = 0, _b = this.filter; _a < _b.length; _a++) {
            var filterCase = _b[_a];
            var typeCopy = {};
            for (var key in rawTypes) {
                typeCopy[key] = rawTypes[key];
            }
            if (this.satisfiesFilterCase(filterCase, typeCopy))
                return true;
        }
        return false;
    };
    FilterString.prototype.satisfiesFilterCase = function (filterCase, types) {
        for (var _i = 0, _a = filterCase.mappings; _i < _a.length; _i++) {
            var typeMapping = _a[_i];
            this.mapTypes(typeMapping, types);
        }
        for (var _b = 0, _c = filterCase.expressions; _b < _c.length; _b++) {
            var expression = _c[_b];
            if (this.satisfiesTypeMatchExpression(expression, types))
                return true;
        }
        return false;
    };
    FilterString.prototype.mapTypes = function (typeMapping, types) {
        if (types[typeMapping.from] !== undefined) {
            var additionalTypes = types[typeMapping.from] * typeMapping.count;
            delete types[typeMapping.from];
            if (types[typeMapping.to] === undefined) {
                types[typeMapping.to] = additionalTypes;
            }
            else {
                types[typeMapping.to] += additionalTypes;
            }
        }
    };
    FilterString.prototype.satisfiesTypeMatchExpression = function (expression, types) {
        var addressedTypes = {};
        for (var _i = 0, expression_1 = expression; _i < expression_1.length; _i++) {
            var typeMatch = expression_1[_i];
            if (!this.satisfiesTypeMatch(typeMatch, types))
                return false;
            addressedTypes[typeMatch.type] = true;
        }
        for (var type in types) {
            //all types must be addressed.
            if (!addressedTypes[type])
                return false;
        }
        return true;
    };
    FilterString.prototype.satisfiesTypeMatch = function (typeMatch, types) {
        var count = types[typeMatch.type];
        var quantifier = typeMatch.quantifier;
        if (quantifier.indexOf("-") != -1) {
            //range
            var min = parseInt(quantifier.substr(0, quantifier.indexOf("-") - 1));
            var max = parseInt(quantifier.substr(quantifier.indexOf("-") + 1));
            return count >= min && count <= max;
        }
        if (quantifier.indexOf("+") != -1) {
            //min+
            var min = parseInt(quantifier.substr(0, quantifier.indexOf("+")));
            return count >= min;
        }
        var exact = parseInt(quantifier);
        return count == exact;
    };
    return FilterString;
}());
exports.default = FilterString;
function getFigureTypeString(figure) {
    if (figure instanceof point_1.default)
        return "point";
    if (figure instanceof line_1.default)
        return "line";
    if (figure instanceof circle_1.default)
        return "circle";
    return null;
}
exports.getFigureTypeString = getFigureTypeString;
//# sourceMappingURL=filterString.js.map