import { ConsoleManager } from "../../../Kairo/utils/ConsoleManager";
import { WerewolfGameManager } from "../WerewolfGameManager";
export class RoleRegister {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
    }
    static create(werewolfGameManager) {
        return new RoleRegister(werewolfGameManager);
    }
    registrationRoles(args) {
        const roles = args.slice(1).map((arg) => {
            let data;
            try {
                data = JSON.parse(arg);
            }
            catch (e) {
                ConsoleManager.error("Failed to parse role registration data: Invalid JSON format.");
            }
            if (data && WerewolfGameManager.getInstance().isRole(data)) {
                return data;
            }
            return null;
        }).filter((role) => role !== null);
        this.werewolfGameManager.setRoles(args[0], roles);
    }
}
