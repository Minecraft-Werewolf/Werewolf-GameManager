export class ConditionNormalizer {
    constructor(gameTerminationEvaluator) {
        this.gameTerminationEvaluator = gameTerminationEvaluator;
    }
    static create(gameTerminationEvaluator) {
        return new ConditionNormalizer(gameTerminationEvaluator);
    }
    normalizeNumeric(value) {
        if (typeof value === "number") {
            return { type: "constant", value };
        }
        if (typeof value === "string") {
            return { type: "gameVariable", key: value };
        }
        return {
            type: "factionAliveCount",
            factionId: value.factionAliveCount,
        };
    }
    normalizeCondition(condition) {
        switch (condition.type) {
            case "comparison":
                return {
                    type: "comparison",
                    operator: condition.operator,
                    left: this.normalizeNumeric(condition.left),
                    right: this.normalizeNumeric(condition.right),
                };
            case "factionAliveCount":
                return {
                    type: "comparison",
                    operator: condition.operator,
                    left: {
                        type: "factionAliveCount",
                        factionId: condition.factionId,
                    },
                    right: this.normalizeNumeric(condition.value),
                };
            case "playerAliveCount":
                return {
                    type: "comparison",
                    operator: condition.operator,
                    left: {
                        type: "gameVariable",
                        key: "alivePlayerCount",
                    },
                    right: this.normalizeNumeric(condition.value),
                };
            case "remainingTime":
                return {
                    type: "comparison",
                    operator: condition.operator,
                    left: {
                        type: "gameVariable",
                        key: "remainingTime",
                    },
                    right: this.normalizeNumeric(condition.value),
                };
            case "and":
                return {
                    type: "and",
                    conditions: condition.conditions.map((c) => this.normalizeCondition(c)),
                };
            case "or":
                return {
                    type: "or",
                    conditions: condition.conditions.map((c) => this.normalizeCondition(c)),
                };
            case "not":
                return {
                    type: "not",
                    condition: this.normalizeCondition(condition.condition),
                };
        }
    }
    evalNumeric(expr, ctx) {
        switch (expr.type) {
            case "constant":
                return expr.value;
            case "gameVariable":
                return ctx[expr.key];
            case "factionAliveCount":
                return ctx.aliveCountByFaction[expr.factionId] ?? 0;
        }
    }
    evalNormalized(condition, ctx) {
        switch (condition.type) {
            case "comparison": {
                const left = this.evalNumeric(condition.left, ctx);
                const right = this.evalNumeric(condition.right, ctx);
                switch (condition.operator) {
                    case "==":
                        return left === right;
                    case "!=":
                        return left !== right;
                    case "<":
                        return left < right;
                    case "<=":
                        return left <= right;
                    case ">":
                        return left > right;
                    case ">=":
                        return left >= right;
                }
            }
            case "and":
                return condition.conditions.every((c) => this.evalNormalized(c, ctx));
            case "or":
                return condition.conditions.some((c) => this.evalNormalized(c, ctx));
            case "not":
                return !this.evalNormalized(condition.condition, ctx);
        }
    }
}
