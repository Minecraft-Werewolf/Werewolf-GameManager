import { KairoUtils, type KairoResponse } from "../../../../../@core/kairo/utils/KairoUtils";
import { KAIRO_DATAVAULT_SAVE_KEYS } from "../../../../constants/systems";
import type { FactionDefinition } from "../../../../data/factions";
import type { DefinitionManager } from "../DefinitionManager";
import { FactionRegistrationValidator } from "./FactionRegistrationValidator";

export class FactionDefinitionManager {
    private readonly registeredDefinitionIds: Set<string> = new Set();

    private readonly factionRegistrationValidator = FactionRegistrationValidator.create(this);
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager): FactionDefinitionManager {
        return new FactionDefinitionManager(definitionManager);
    }

    public async registerFactionDefinitions(
        addonId: string,
        roles: unknown[],
    ): Promise<KairoResponse> {
        const validateResult = await this.factionRegistrationValidator.validate(
            addonId,
            roles,
            this.registeredDefinitionIds,
        );
        const validatedDefinitionIds = validateResult.validatedDefinitions.map(
            (definition) => definition.id,
        );

        if (validateResult.isSuccessful) {
            validatedDefinitionIds.forEach((id) => {
                this.registeredDefinitionIds.add(id);
            });

            await this.saveDefinitionsToDataVault(addonId, validateResult.validatedDefinitions);
        }

        this.definitionManager.notifiyRegistrationResult(
            validateResult.isSuccessful,
            "role",
            addonId,
            validatedDefinitionIds,
        );

        return KairoUtils.buildKairoResponse({}, validateResult.isSuccessful);
    }

    private async saveDefinitionsToDataVault(
        addonId: string,
        definitions: FactionDefinition[],
    ): Promise<void> {
        return this.definitionManager.saveDefinitionsToDataVault(
            addonId,
            JSON.stringify(definitions),
            KAIRO_DATAVAULT_SAVE_KEYS.FACTION_DEFINITIONS_ADDON_LIST,
            KAIRO_DATAVAULT_SAVE_KEYS.FACTION_DEFINITIONS_PREFIX,
        );
    }
}
