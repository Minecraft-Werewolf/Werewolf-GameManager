import type { FactionDefinition } from "../../../data/factions";
import type { FactionManager } from "./FactionManager";

export interface ValidateFactionRegistrationResult {
    addonId: string;
    isSuccessful: boolean;
    validatedFactions: FactionDefinition[];
}

export class FactionRegistrationValidator {
    private constructor(private readonly factionManager: FactionManager) {}
    public static create(factionManager: FactionManager): FactionRegistrationValidator {
        return new FactionRegistrationValidator(factionManager);
    }

    public validateFactionRegistration(
        addonId: string,
        factions: unknown[],
    ): ValidateFactionRegistrationResult {
        if (!addonId || !Array.isArray(factions)) {
            return {
                addonId,
                isSuccessful: false,
                validatedFactions: [],
            };
        }

        const validatedFactions: FactionDefinition[] = factions
            .map((item) => {
                if (this.factionManager.isFaction(item)) {
                    const role = item as FactionDefinition;
                    role.providerAddonId = addonId;
                    return role;
                }
                return null;
            })
            .filter((role): role is FactionDefinition => role !== null);

        return {
            addonId,
            isSuccessful: validatedFactions.length > 0,
            validatedFactions,
        };
    }
}
