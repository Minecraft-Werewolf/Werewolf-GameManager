import type { FactionDefinition } from "../../../data/factions";
import type { RoleManager } from "../roles/RoleManager";
import { FactionDataValidator } from "./FactionDataValidator";
import { FactionRegistrationNotifier } from "./FactionRegistrationNotifier";
import { FactionRegistrationValidator } from "./FactionRegistrationValidator.ts";
import { FactionReRegistrationRequester } from "./FactionReRegistrationRequester.ts";

export class FactionManager {
    private readonly factionDataValidator: FactionDataValidator;
    private readonly factionRegistrationNotifier: FactionRegistrationNotifier;
    private readonly factionRegistrationValidator: FactionRegistrationValidator;
    private readonly factionReRegistrationRequester: FactionReRegistrationRequester;
    private readonly registeredFactionDefinitions: Map<string, FactionDefinition[]> = new Map();
    private readonly selectedFactionsForNextGame: FactionDefinition[] = [];
    private constructor(private readonly roleManager: RoleManager) {
        this.factionDataValidator = FactionDataValidator.create(this);
        this.factionRegistrationNotifier = FactionRegistrationNotifier.create(this);
        this.factionRegistrationValidator = FactionRegistrationValidator.create(this);
        this.factionReRegistrationRequester = FactionReRegistrationRequester.create(this);
    }
    public static create(roleManager: RoleManager): FactionManager {
        return new FactionManager(roleManager);
    }
}
