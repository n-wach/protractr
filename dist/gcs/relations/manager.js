"use strict";
/**
 * @module gcs/relations
 */
/** */
Object.defineProperty(exports, "__esModule", { value: true });
var relationEqual_1 = require("./relationEqual");
var relationColinearPoints_1 = require("./relationColinearPoints");
var relationPointsOnCircle_1 = require("./relationPointsOnCircle");
var relationEqualLength_1 = require("./relationEqualLength");
var RelationManager = /** @class */ (function () {
    function RelationManager() {
        this.relations = [];
    }
    RelationManager.prototype.getTotalError = function () {
        var error = 0;
        for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
            var relation = _a[_i];
            error += relation.getError();
        }
        return error;
    };
    RelationManager.prototype.isSolved = function () {
        return this.getTotalError() < RelationManager.SOLVE_TOLERANCE;
    };
    RelationManager.prototype.solveRelations = function (tireless) {
        if (tireless === void 0) { tireless = false; }
        var startTime = new Date().getTime();
        var count = 1;
        while (true) {
            if (RelationManager.DEBUG_SOLVE && count >= 2)
                return; // debug shows only one iteration
            if (this.isSolved() && count > 10)
                return; // solved, still do a few iterations for fun though...
            if (!tireless && count > 150)
                return; // not tireless so we can give up quickly
            // even if tireless, we should still give up eventually...
            if (count % 10000 == 0) {
                var currentTime = new Date().getTime();
                if (currentTime - startTime > 1000)
                    return; //give up after one second.
            }
            var variableDeltas = [];
            for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
                var relation = _a[_i];
                variableDeltas.push.apply(variableDeltas, relation.getDeltas());
            }
            // sort variables by value reference and count contributors
            var values = new Map();
            for (var _b = 0, variableDeltas_1 = variableDeltas; _b < variableDeltas_1.length; _b++) {
                var variableDelta = variableDeltas_1[_b];
                var value = variableDelta[0]._v;
                var delta = variableDelta[1];
                if (values.has(value)) {
                    var valueDelta = values.get(value);
                    valueDelta.contributorCount += 1;
                    valueDelta.totalDelta += delta;
                }
                else {
                    values.set(value, {
                        contributorCount: 1,
                        totalDelta: delta,
                    });
                }
            }
            values.forEach((function (valueDelta, value) {
                var scaledDelta = valueDelta.totalDelta / (2 + valueDelta.contributorCount);
                value.v += scaledDelta;
            }));
            count += 1;
        }
    };
    RelationManager.prototype.addEqualAndMerge = function (newRelation) {
        var mergedVariables = newRelation.variables;
        for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (relation instanceof relationEqual_1.default) {
                if (RelationManager.doArraysIntersect(relation.variables, newRelation.variables)) {
                    for (var _b = 0, _c = relation.variables; _b < _c.length; _b++) {
                        var v = _c[_b];
                        if (mergedVariables.indexOf(v) == -1) {
                            mergedVariables.push(v);
                        }
                    }
                    var index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                }
            }
        }
        this.relations.push(newRelation);
    };
    RelationManager.prototype.addColinearAndMerge = function (newRelation) {
        var mergedPoints = newRelation.points;
        for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (relation instanceof relationColinearPoints_1.default) {
                if (RelationManager.doArraysIntersect(relation.points, newRelation.points, 2)) {
                    for (var _b = 0, _c = relation.points; _b < _c.length; _b++) {
                        var p = _c[_b];
                        if (mergedPoints.indexOf(p) == -1) {
                            mergedPoints.push(p);
                            newRelation.variables.push(p._x);
                            newRelation.variables.push(p._y);
                        }
                    }
                    var index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                }
            }
        }
        this.relations.push(newRelation);
    };
    RelationManager.prototype.addPointsOnCircleAndMerge = function (newRelation) {
        var mergedPoints = newRelation.points;
        for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (relation instanceof relationPointsOnCircle_1.default) {
                if (relation.circle == newRelation.circle) {
                    for (var _b = 0, _c = relation.points; _b < _c.length; _b++) {
                        var p = _c[_b];
                        if (mergedPoints.indexOf(p) == -1) {
                            mergedPoints.push(p);
                            newRelation.variables.push(p._x);
                            newRelation.variables.push(p._y);
                        }
                    }
                    var index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                    // Assuming good merging, there will be at most
                    // one other relation with the same circle
                    break;
                }
            }
        }
        this.relations.push(newRelation);
    };
    RelationManager.prototype.addEqualLengthAndMerge = function (newRelation) {
        var mergedLines = newRelation.lines;
        for (var _i = 0, _a = this.relations; _i < _a.length; _i++) {
            var relation = _a[_i];
            if (relation instanceof relationEqualLength_1.default) {
                if (RelationManager.doArraysIntersect(relation.lines, newRelation.lines)) {
                    for (var _b = 0, _c = relation.lines; _b < _c.length; _b++) {
                        var l = _c[_b];
                        if (mergedLines.indexOf(l) == -1) {
                            mergedLines.push(l);
                            newRelation.variables.push(l.p0._x);
                            newRelation.variables.push(l.p0._y);
                            newRelation.variables.push(l.p1._x);
                            newRelation.variables.push(l.p1._y);
                        }
                    }
                    var index = this.relations.indexOf(relation);
                    this.relations.splice(index, 1);
                }
            }
        }
        this.relations.push(newRelation);
    };
    RelationManager.prototype.addRelationAndMerge = function (relation) {
        if (relation instanceof relationEqual_1.default) {
            this.addEqualAndMerge(relation);
        }
        else if (relation instanceof relationColinearPoints_1.default) {
            this.addColinearAndMerge(relation);
        }
        else if (relation instanceof relationPointsOnCircle_1.default) {
            this.addPointsOnCircleAndMerge(relation);
        }
        else if (relation instanceof relationEqualLength_1.default) {
            this.addEqualLengthAndMerge(relation);
        }
        else {
            // no known merger
            this.relations.push(relation);
        }
    };
    RelationManager.prototype.addRelations = function () {
        var relations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            relations[_i] = arguments[_i];
        }
        for (var _a = 0, relations_1 = relations; _a < relations_1.length; _a++) {
            var relation = relations_1[_a];
            this.addRelationAndMerge(relation);
        }
        this.solveRelations(true);
    };
    RelationManager.prototype.removeRelation = function (relation) {
        var index = this.relations.indexOf(relation);
        if (index === -1)
            return;
        this.relations.splice(index, 1);
        relation.remove();
    };
    RelationManager.prototype.removeRelations = function () {
        var relations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            relations[_i] = arguments[_i];
        }
        for (var _a = 0, relations_2 = relations; _a < relations_2.length; _a++) {
            var relation = relations_2[_a];
            this.removeRelation(relation);
        }
    };
    /**
     * Are there at least minCount values in both array0 and array1
     * @param array0
     * @param array1
     * @param minCount
     */
    RelationManager.doArraysIntersect = function (array0, array1, minCount) {
        if (minCount === void 0) { minCount = 1; }
        if (array0.length == 0 || array1.length == 0)
            return false;
        var count = 0;
        for (var _i = 0, array0_1 = array0; _i < array0_1.length; _i++) {
            var v0 = array0_1[_i];
            if (array1.indexOf(v0) != -1)
                count++;
            if (count >= minCount)
                return true;
        }
        return false;
    };
    RelationManager.DEBUG_SOLVE = false;
    RelationManager.SOLVE_TOLERANCE = 1;
    return RelationManager;
}());
exports.default = RelationManager;
//# sourceMappingURL=manager.js.map