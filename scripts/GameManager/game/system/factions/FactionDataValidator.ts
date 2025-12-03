import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import type { FactionManager } from "./FactionManager";

export class FactionDataValidator {
    private constructor(private readonly factionManager: FactionManager) {}
    public static create(factionManager: FactionManager): FactionDataValidator {
        return new FactionDataValidator(factionManager);
    }

    public isFaction(data: unknown): boolean {
        if (!this.isObject(data)) return false;

        if (typeof data.id !== "string") return false;
        if (!KairoUtils.isRawMessage(data.name)) return false;
        if (!KairoUtils.isRawMessage(data.description)) return false;
        if (typeof data.defaultColor !== "string") return false;
        if (!this.isObject(data.victoryCondition)) return false;
        if (!KairoUtils.isRawMessage(data.victoryCondition.description)) return false;
        if (typeof data.sortIndex !== "number") return false;

        return true;
    }

    private isObject(x: unknown): x is Record<string, unknown> {
        return typeof x === "object" && x !== null && !Array.isArray(x);
    }
}
