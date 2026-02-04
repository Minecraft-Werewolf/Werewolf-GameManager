import { KairoUtils, type KairoResponse } from "../../../../../@core/kairo/utils/KairoUtils";
import { KAIRO_DATAVAULT_SAVE_KEYS } from "../../../../constants/systems";
import type { RoleGroupDefinition } from "../../../../data/rolegroup";
import type { DefinitionManager } from "../DefinitionManager";
import { RoleGroupRegistrationValidator } from "./RoleGroupRegistrationValidator";

export class RoleGroupDefinitionManager {
    private readonly registeredDefinitionIds: Set<string> = new Set();

    private readonly roleRegistrationValidator = RoleGroupRegistrationValidator.create(this);
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager): RoleGroupDefinitionManager {
        return new RoleGroupDefinitionManager(definitionManager);
    }

    public async registerRoleGroupDefinitions(
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
        definitions: RoleGroupDefinition[],
    ): Promise<void> {
        return this.definitionManager.saveDefinitionsToDataVault(
            addonId,
            JSON.stringify(definitions),
            KAIRO_DATAVAULT_SAVE_KEYS.ROLEGROUP_DEFINITIONS_ADDON_LIST,
            KAIRO_DATAVAULT_SAVE_KEYS.ROLEGROUP_DEFINITIONS_PREFIX,
        );
    }
}
