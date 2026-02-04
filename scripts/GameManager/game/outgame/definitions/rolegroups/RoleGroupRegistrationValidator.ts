import type { RoleGroupDefinition } from "../../../../data/rolegroup";
import type { RoleGroupDefinitionManager } from "./RoleGroupDefinitionManager";
import { RoleGroupDefinitionValidator } from "./RoleGroupDefinitionValidator";

export interface ValidateRoleRegistrationResult {
    addonId: string;
    isSuccessful: boolean;
    validatedDefinitions: RoleGroupDefinition[];
}

export class RoleGroupRegistrationValidator {
    private readonly roleDefinitionValidator = RoleGroupDefinitionValidator.create(this);
    private constructor(private readonly roleDefinitionManager: RoleGroupDefinitionManager) {}
    public static create(
        roleDefinitionManager: RoleGroupDefinitionManager,
    ): RoleGroupRegistrationValidator {
        return new RoleGroupRegistrationValidator(roleDefinitionManager);
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

        const validatedDefinitions: RoleGroupDefinition[] = definitions
            .map((item) => {
                if (this.roleDefinitionValidator.isRoleGroup(item)) {
                    const definition = item as RoleGroupDefinition;
                    if (registeredDefinitionIds.has(definition.id)) {
                        // id被りのエラーハンドリング
                        return null;
                    }
                    definition.providerAddonId = addonId;

                    return definition;
                }
                return null;
            })
            .filter((definition): definition is RoleGroupDefinition => definition !== null);

        return {
            addonId,
            isSuccessful: validatedDefinitions.length > 0,
            validatedDefinitions,
        };
    }
}
