import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
export class RoleRegister {
    constructor(roleManager) {
        this.roleManager = roleManager;
    }
    static create(roleManager) {
        return new RoleRegister(roleManager);
    }
    registerRoles(args) {
        const roles = args
            .slice(1)
            .map((arg) => {
            let data;
            try {
                data = JSON.parse(arg);
            }
            catch (e) {
                ConsoleManager.error("Failed to parse role registration data: Invalid JSON format.");
            }
            if (data && this.roleManager.isRole(data)) {
                return data;
            }
            return null;
        })
            .filter((role) => role !== null);
        this.roleManager.setRoles(args[0], roles);
    }
}
