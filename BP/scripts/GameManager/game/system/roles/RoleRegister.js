import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
export class RoleRegister {
    constructor(roleManager) {
        this.roleManager = roleManager;
    }
    static create(roleManager) {
        return new RoleRegister(roleManager);
    }
    registerRoles(addonId, roles) {
        if (!addonId || !Array.isArray(roles)) {
            ConsoleManager.warn(`[ScriptEventReceiver] Invalid register Roles. Data: ${JSON.stringify(roles)}`);
            return;
        }
        const rolesArray = roles
            .map((item) => {
            if (this.roleManager.isRole(item)) {
                const role = item;
                role.providerAddonId = addonId;
                return role;
            }
            return null;
        })
            .filter((role) => role !== null);
        this.roleManager.setRoles(addonId, rolesArray);
    }
}
