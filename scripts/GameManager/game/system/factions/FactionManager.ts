import type { FactionDefinition } from "../../../data/factions";
import type { RoleManager } from "../roles/RoleManager";

export class FactionManager {
    private readonly registeredFactionDefinitions: Map<string, FactionDefinition[]> = new Map();
    private readonly selectedFactionsForNextGame: FactionDefinition[] = [];
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): FactionManager {
        return new FactionManager(roleManager);
    }
}
