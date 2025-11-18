import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import type { RoleDefinition } from "../../../data/roles";
import type { RoleManager } from "./RoleManager";

export class RoleRegister {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleRegister {
        return new RoleRegister(roleManager);
    }

    public registerRoles(addonId: string, roles: unknown[]): void {
        if (!addonId || !Array.isArray(roles)) {
            ConsoleManager.warn(
                `[ScriptEventReceiver] Invalid register Roles. Data: ${JSON.stringify(roles)}`,
            );
            return;
        }

        const rolesArray: RoleDefinition[] = roles
            .map((item) => {
                if (this.roleManager.isRole(item)) {
                    const role = item as RoleDefinition;
                    role.providerAddonId = addonId;
                    return role;
                }
                return null;
            })
            .filter((role): role is RoleDefinition => role !== null);

        this.roleManager.setRoles(addonId, rolesArray);
    }
}
