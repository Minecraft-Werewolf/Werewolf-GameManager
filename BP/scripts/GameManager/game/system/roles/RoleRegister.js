import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
export class RoleRegister {
    constructor(systemManager) {
        this.systemManager = systemManager;
    }
    static create(systemManager) {
        return new RoleRegister(systemManager);
    }
    registerRoles(args) {
        const roles = args.slice(1).map((arg) => {
            let data;
            try {
                data = JSON.parse(arg);
            }
            catch (e) {
                ConsoleManager.error("Failed to parse role registration data: Invalid JSON format.");
            }
            if (data && this.systemManager.isRole(data)) {
                return data;
            }
            return null;
        }).filter((role) => role !== null);
        this.systemManager.setRoles(args[0], roles);
    }
}
