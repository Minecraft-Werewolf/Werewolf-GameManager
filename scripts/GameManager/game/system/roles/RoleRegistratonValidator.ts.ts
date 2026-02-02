import { KairoUtils } from "../../../../@core/kairo/utils/KairoUtils";
import { KAIRO_DATAVAULT_SAVE_KEYS } from "../../../constants/systems";
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

    public async validateRoleRegistration(
        addonId: string,
        roles: unknown[],
    ): Promise<ValidateRoleRegistrationResult> {
        if (!addonId || !Array.isArray(roles)) {
            return {
                addonId,
                isSuccessful: false,
                validatedRoles: [],
            };
        }

        const loaded = await KairoUtils.loadFromDataVault(
            KAIRO_DATAVAULT_SAVE_KEYS.ROLE_COMPOSITION_PREFIX + addonId,
        );

        const loadedRoleComposition: Record<string, number> =
            typeof loaded === "string" ? JSON.parse(loaded) : {};

        const validatedRoles: RoleDefinition[] = roles
            .map((item) => {
                if (this.roleManager.isRole(item)) {
                    if (!this.roleManager.isRole(item)) return null;

                    const role = item as RoleDefinition;
                    role.providerAddonId = addonId;

                    role.count ??= {};
                    role.count.amount = loadedRoleComposition[role.id] ?? 0;

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
