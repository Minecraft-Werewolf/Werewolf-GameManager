export class FactionRegistrationValidator {
    constructor(factionManager) {
        this.factionManager = factionManager;
    }
    static create(factionManager) {
        return new FactionRegistrationValidator(factionManager);
    }
    validateFactionRegistration(addonId, factions) {
        if (!addonId || !Array.isArray(factions)) {
            return {
                addonId,
                isSuccessful: false,
                validatedFactions: [],
            };
        }
        const validatedFactions = factions
            .map((item) => {
            if (this.factionManager.isFaction(item)) {
                const role = item;
                role.providerAddonId = addonId;
                return role;
            }
            return null;
        })
            .filter((role) => role !== null);
        return {
            addonId,
            isSuccessful: validatedFactions.length > 0,
            validatedFactions,
        };
    }
}
