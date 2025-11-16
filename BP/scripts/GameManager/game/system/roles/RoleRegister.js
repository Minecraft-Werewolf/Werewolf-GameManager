import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
export class RoleRegister {
    constructor(roleManager) {
        this.roleManager = roleManager;
    }
    static create(roleManager) {
        return new RoleRegister(roleManager);
    }
    registerRoles(addonId, roles) {
        const rolesArray = roles
            .map((role) => {
            if (this.roleManager.isRole(role)) {
                return role;
            }
            console.log("aieo");
            return null;
        })
            .filter((role) => role !== null);
        this.roleManager.setRoles(addonId, rolesArray);
    }
}
