import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
export class FactionDataValidator {
    constructor(factionManager) {
        this.factionManager = factionManager;
    }
    static create(factionManager) {
        return new FactionDataValidator(factionManager);
    }
    isFaction(data) {
        if (!this.isObject(data))
            return false;
        if (typeof data.id !== "string")
            return false;
        if (!KairoUtils.isRawMessage(data.name))
            return false;
        if (!KairoUtils.isRawMessage(data.description))
            return false;
        if (typeof data.defaultColor !== "string")
            return false;
        if (!this.isVictoryCondition(data.victoryCondition))
            return false;
        if (typeof data.sortIndex !== "number")
            return false;
        return true;
    }
    isGameOutcomeRule(data) {
        if (!this.isObject(data))
            return false;
        if (typeof data.id !== "string")
            return false;
        if (typeof data.priority !== "number")
            return false;
        if (!this.isCondition(data.condition))
            return false;
        if (!this.isGameOutcome(data.outcome))
            return false;
        if (!this.isPresentation(data.presentation))
            return false;
        return true;
    }
    isVictoryCondition(data) {
        if (!this.isObject(data))
            return false;
        if (typeof data.priority !== "number")
            return false;
        if (!this.isCondition(data.condition))
            return false;
        if (!KairoUtils.isRawMessage(data.description))
            return false;
        if (!this.isPresentation(data.presentation))
            return false;
        return true;
    }
    isGameOutcome(data) {
        if (!this.isObject(data))
            return false;
        switch (data.type) {
            case "victory":
                return typeof data.factionId === "string";
            case "draw":
            case "end":
                return typeof data.reason === "string";
            default:
                return false;
        }
    }
    isPresentation(data) {
        if (!this.isObject(data))
            return false;
        if (!KairoUtils.isRawMessage(data.title))
            return false;
        if (!KairoUtils.isRawMessage(data.message))
            return false;
        return true;
    }
    /* =========================
     * Condition
     * ========================= */
    isCondition(data) {
        if (!this.isObject(data))
            return false;
        if (typeof data.type !== "string")
            return false;
        switch (data.type) {
            case "comparison":
                return this.isComparisonCondition(data);
            case "factionAliveCount":
                return this.isFactionAliveCountComparison(data);
            case "playerAliveCount":
                return this.isPlayerAliveCountComparison(data);
            case "remainingTime":
                return this.isRemainingTimeComparison(data);
            case "and":
                return this.isAndCondition(data);
            case "or":
                return this.isOrCondition(data);
            case "not":
                return this.isNotCondition(data);
            default:
                return false;
        }
    }
    isComparisonCondition(data) {
        return (this.isOperator(data.operator) &&
            this.isNumericValue(data.left) &&
            this.isNumericValue(data.right));
    }
    isFactionAliveCountComparison(data) {
        return (typeof data.factionId === "string" &&
            this.isOperator(data.operator) &&
            this.isNumericValue(data.value));
    }
    isPlayerAliveCountComparison(data) {
        return this.isOperator(data.operator) && this.isNumericValue(data.value);
    }
    isRemainingTimeComparison(data) {
        return this.isOperator(data.operator) && this.isNumericValue(data.value);
    }
    isAndCondition(data) {
        return (Array.isArray(data.conditions) &&
            data.conditions.every((c) => this.isCondition(c)));
    }
    isOrCondition(data) {
        return (Array.isArray(data.conditions) &&
            data.conditions.every((c) => this.isCondition(c)));
    }
    isNotCondition(data) {
        return this.isCondition(data.condition);
    }
    isNumericValue(value) {
        if (typeof value === "number")
            return true;
        if (value === "remainingTime" || value === "alivePlayerCount")
            return true;
        if (this.isObject(value)) {
            return typeof value.factionAliveCount === "string";
        }
        return false;
    }
    isOperator(op) {
        return op === "==" || op === "!=" || op === "<" || op === "<=" || op === ">" || op === ">=";
    }
    isObject(x) {
        return typeof x === "object" && x !== null && !Array.isArray(x);
    }
}
