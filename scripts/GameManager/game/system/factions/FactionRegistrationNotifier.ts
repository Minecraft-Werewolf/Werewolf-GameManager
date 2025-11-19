import type { FactionManager } from "./FactionManager";

export class FactionRegistrationNotifier {
    private constructor(private readonly factionManager: FactionManager) {}
    public static create(factionManager: FactionManager): FactionRegistrationNotifier {
        return new FactionRegistrationNotifier(factionManager);
    }
}
