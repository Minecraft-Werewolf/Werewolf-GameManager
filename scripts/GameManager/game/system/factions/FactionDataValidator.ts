import type { FactionManager } from "./FactionManager";

export class FactionDataValidator {
    private constructor(private readonly factionManager: FactionManager) {}
    public static create(factionManager: FactionManager): FactionDataValidator {
        return new FactionDataValidator(factionManager);
    }
}
