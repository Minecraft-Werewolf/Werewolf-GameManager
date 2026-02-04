import type { FactionDefinition } from "../../../../data/factions";
import type { FactionDefinitionManager } from "./FactionDefinitionManager";
import { FactionDefinitionValidator } from "./FactionDefinitionValidator";

export interface ValidateFactionRegistrationResult {
    addonId: string;
    isSuccessful: boolean;
    validatedDefinitions: FactionDefinition[];
}

export class FactionRegistrationValidator {
    private readonly roleDefinitionValidator = FactionDefinitionValidator.create(this);
    private constructor(private readonly factionDefinitionManager: FactionDefinitionManager) {}
    public static create(
        factionDefinitionManager: FactionDefinitionManager,
    ): FactionRegistrationValidator {
        return new FactionRegistrationValidator(factionDefinitionManager);
    }

    public async validate(
        addonId: string,
        definitions: unknown[],
        registeredDefinitionIds: Set<string>,
    ): Promise<ValidateFactionRegistrationResult> {
        if (!addonId || !Array.isArray(definitions)) {
            return {
                addonId,
                isSuccessful: false,
                validatedDefinitions: [],
            };
        }

        const validatedDefinitions: FactionDefinition[] = definitions
            .map((item) => {
                if (this.roleDefinitionValidator.isFaction(item)) {
                    const definition = item as FactionDefinition;
                    if (registeredDefinitionIds.has(definition.id)) {
                        // id被りのエラーハンドリング
                        return null;
                    }
                    definition.providerAddonId = addonId;

                    return definition;
                }
                return null;
            })
            .filter((definition): definition is FactionDefinition => definition !== null);

        return {
            addonId,
            isSuccessful: validatedDefinitions.length > 0,
            validatedDefinitions,
        };
    }
}
