import { KairoUtils } from "../../../../../@core/kairo/utils/KairoUtils";
import { KAIRO_DATAVAULT_SAVE_KEYS } from "../../../../constants/systems";
import type { RoleDefinition } from "../../../../data/roles";
import type { RoleDefinitionManager } from "./RoleDefinitionManager";
import { RoleDefinitionValidator } from "./RoleDefinitionValidator";

export interface ValidateRoleRegistrationResult {
    addonId: string;
    isSuccessful: boolean;
    validatedDefinitions: RoleDefinition[];
}

export class RoleRegistrationValidator {
    private readonly roleDefinitionValidator = RoleDefinitionValidator.create(this);
    private constructor(private readonly roleDefinitionManager: RoleDefinitionManager) {}
    public static create(roleDefinitionManager: RoleDefinitionManager): RoleRegistrationValidator {
        return new RoleRegistrationValidator(roleDefinitionManager);
    }

    public async validate(
        addonId: string,
        definitions: unknown[],
        registeredDefinitionIds: Set<string>,
    ): Promise<ValidateRoleRegistrationResult> {
        if (!addonId || !Array.isArray(definitions)) {
            return {
                addonId,
                isSuccessful: false,
                validatedDefinitions: [],
            };
        }

        const loaded = await KairoUtils.loadFromDataVault(
            KAIRO_DATAVAULT_SAVE_KEYS.ROLE_COMPOSITION_PREFIX + addonId,
        );

        const loadedRoleComposition: Record<string, number> =
            typeof loaded === "string" ? JSON.parse(loaded) : {};

        const validatedDefinitions: RoleDefinition[] = definitions
            .map((item) => {
                if (this.roleDefinitionValidator.isRole(item)) {
                    const definition = item as RoleDefinition;
                    if (registeredDefinitionIds.has(definition.id)) {
                        // id被りのエラーハンドリング
                        return null;
                    }
                    definition.providerAddonId = addonId;

                    definition.count ??= {};
                    definition.count.amount = loadedRoleComposition[definition.id] ?? 0;

                    return definition;
                }
                return null;
            })
            .filter((definition): definition is RoleDefinition => definition !== null);

        return {
            addonId,
            isSuccessful: validatedDefinitions.length > 0,
            validatedDefinitions,
        };
    }
}
