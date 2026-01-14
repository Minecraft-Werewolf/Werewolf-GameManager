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
            case "standardFactionVictory":
                return { type: "standardFactionVictory" };
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
    evalNormalized(condition, ctx, factionId) {
        switch (condition.type) {
            case "standardFactionVictory":
                return this.evalStandardFactionVictory(ctx, factionId);
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
                return condition.conditions.every((c) => this.evalNormalized(c, ctx, factionId));
            case "or":
                return condition.conditions.some((c) => this.evalNormalized(c, ctx, factionId));
            case "not":
                return !this.evalNormalized(condition.condition, ctx, factionId);
        }
    }
    evalStandardFactionVictory(ctx, factionId) {
        if (factionId === undefined)
            return false;
        const factions = this.gameTerminationEvaluator
            .getGameManager()
            .getFactionDefinitions()
            .filter((f) => f.type === "standard");
        const selfAliveCount = ctx.aliveCountByFaction[factionId] ?? 0;
        if (selfAliveCount <= 0)
            return false;
        let otherAliveCount = 0;
        for (const other of factions) {
            if (other.id === factionId)
                continue;
            otherAliveCount += ctx.aliveCountByFaction[other.id] ?? 0;
        }
        if (otherAliveCount === 0) {
            return true;
        }
        return false;
    }
}
