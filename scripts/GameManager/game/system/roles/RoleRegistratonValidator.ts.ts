import type { RoleDefinition } from "../../../data/roles";
import type { RoleManager } from "./RoleManager";

export interface ValidateRoleRegistrationResult {
    addonId: string;
    isSuccessful: boolean;
    validatedRoles: RoleDefinition[];
}

export class RoleRegistrationValidator {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleRegistrationValidator {
        return new RoleRegistrationValidator(roleManager);
    }

    public validateRoleRegistration(
        addonId: string,
        roles: unknown[],
    ): ValidateRoleRegistrationResult {
        if (!addonId || !Array.isArray(roles)) {
            return {
                addonId,
                isSuccessful: false,
                validatedRoles: [],
            };
        }

        const validatedRoles: RoleDefinition[] = roles
            .map((item) => {
                if (this.roleManager.isRole(item)) {
                    const role = item as RoleDefinition;
                    role.providerAddonId = addonId;

                    if (role.count === undefined) role.count = {};
                    role.count.amount = 0;

                    return role;
                }
                return null;
            })
            .filter((role): role is RoleDefinition => role !== null);

        return {
            addonId,
            isSuccessful: validatedRoles.length > 0,
            validatedRoles,
        };
    }
}
