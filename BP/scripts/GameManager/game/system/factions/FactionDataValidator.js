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
        if (!this.isObject(data.victoryCondition))
            return false;
        if (!KairoUtils.isRawMessage(data.victoryCondition.description))
            return false;
        if (typeof data.sortIndex !== "number")
            return false;
        return true;
    }
    isObject(x) {
        return typeof x === "object" && x !== null && !Array.isArray(x);
    }
}
