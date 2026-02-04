import type { SettingDefinition } from "../../../../data/settings";
import type { SettingDefinitionManager } from "./SettingDefinitionManager";
import { SettingDefinitionValidator } from "./SettingDefinitionValidator";

export interface ValidateRoleRegistrationResult {
    addonId: string;
    isSuccessful: boolean;
    validatedDefinitions: SettingDefinition[];
}

export class SettingRegistrationValidator {
    private readonly roleDefinitionValidator = SettingDefinitionValidator.create(this);
    private constructor(private readonly roleDefinitionManager: SettingDefinitionManager) {}
    public static create(
        roleDefinitionManager: SettingDefinitionManager,
    ): SettingRegistrationValidator {
        return new SettingRegistrationValidator(roleDefinitionManager);
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

        const validatedDefinitions: SettingDefinition[] = definitions
            .map((item) => {
                if (this.roleDefinitionValidator.isSetting(item)) {
                    const definition = item as SettingDefinition;
                    if (registeredDefinitionIds.has(definition.id)) {
                        // id被りのエラーハンドリング
                        return null;
                    }
                    definition.providerAddonId = addonId;

                    return definition;
                }
                return null;
            })
            .filter((definition): definition is SettingDefinition => definition !== null);

        return {
            addonId,
            isSuccessful: validatedDefinitions.length > 0,
            validatedDefinitions,
        };
    }
}
