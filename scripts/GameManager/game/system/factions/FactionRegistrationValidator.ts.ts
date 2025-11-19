import type { FactionManager } from "./FactionManager";

export class FactionRegistrationValidator {
    private constructor(private readonly factionManager: FactionManager) {}
    public static create(factionManager: FactionManager): FactionRegistrationValidator {
        return new FactionRegistrationValidator(factionManager);
    }
}
