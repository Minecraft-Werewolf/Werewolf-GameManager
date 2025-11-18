import type { RoleDefinition } from "../../../data/roles";
import type { RoleManager } from "./RoleManager";

export interface ValidateRegistrationResult {
    addonId: string;
    isSuccessful: boolean;
    registered: RoleDefinition[];
}

export class RoleRegistrationValidator {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleRegistrationValidator {
        return new RoleRegistrationValidator(roleManager);
    }

    public validateRoleRegistration(addonId: string, roles: unknown[]): ValidateRegistrationResult {
        if (!addonId || !Array.isArray(roles)) {
            return {
                addonId,
                isSuccessful: false,
                registered: [],
            };
        }

        const registered: RoleDefinition[] = roles
            .map((item) => {
                if (this.roleManager.isRole(item)) {
                    const role = item as RoleDefinition;
                    role.providerAddonId = addonId;
                    return role;
                }
                return null;
            })
            .filter((role): role is RoleDefinition => role !== null);

        return {
            addonId,
            isSuccessful: registered.length > 0,
            registered,
        };
    }
}
