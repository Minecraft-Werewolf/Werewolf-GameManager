import type { FactionManager } from "./FactionManager";

export class FactionReRegistrationRequester {
    private constructor(private readonly factionManager: FactionManager) {}
    public static create(factionManager: FactionManager): FactionReRegistrationRequester {
        return new FactionReRegistrationRequester(factionManager);
    }
}
