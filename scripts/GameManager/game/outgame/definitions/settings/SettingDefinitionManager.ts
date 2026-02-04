import { KairoUtils, type KairoResponse } from "../../../../../@core/kairo/utils/KairoUtils";
import { KAIRO_DATAVAULT_SAVE_KEYS } from "../../../../constants/systems";
import type { SettingDefinition } from "../../../../data/settings";
import type { DefinitionManager } from "../DefinitionManager";
import { SettingRegistrationValidator } from "./SettingRegistrationValidator";

export class SettingDefinitionManager {
    private readonly registeredDefinitionIds: Set<string> = new Set();

    private readonly roleRegistrationValidator = SettingRegistrationValidator.create(this);
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager): SettingDefinitionManager {
        return new SettingDefinitionManager(definitionManager);
    }

    public async registerSettingDefinitions(
        addonId: string,
        roles: unknown[],
    ): Promise<KairoResponse> {
        const validateResult = await this.roleRegistrationValidator.validate(
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
        definitions: SettingDefinition[],
    ): Promise<void> {
        return this.definitionManager.saveDefinitionsToDataVault(
            addonId,
            JSON.stringify(definitions),
            KAIRO_DATAVAULT_SAVE_KEYS.SETTING_DEFINITIONS_ADDON_LIST,
            KAIRO_DATAVAULT_SAVE_KEYS.SETTING_DEFINITIONS_PREFIX,
        );
    }
}
