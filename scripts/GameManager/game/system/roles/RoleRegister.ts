import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import type { Role } from "../../../data/roles";
import type { RoleManager } from "./RoleManager";

export class RoleRegister {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleRegister {
        return new RoleRegister(roleManager);
    }

    public registerRoles(addonId: string, roles: Object[]): void {
        if (!addonId || !Array.isArray(roles)) {
            ConsoleManager.warn(
                `[ScriptEventReceiver] Invalid register Roles. Data: ${JSON.stringify(roles)}`,
            );
            return;
        }

        const rolesArray: Role[] = roles
            .map((role) => {
                if (this.roleManager.isRole(role)) {
                    return role as Role;
                }
                console.log("aieo");
                return null;
            })
            .filter((role): role is Role => role !== null);

        this.roleManager.setRoles(addonId, rolesArray);
    }
}
