import { werewolfGameManager } from "../..";
import { ConsoleManager } from "../../../Kairo/utils/ConsoleManager";
export class RoleRegistrationReceiver {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
    }
    static create(werewolfGameManager) {
        return new RoleRegistrationReceiver(werewolfGameManager);
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
            if (data && werewolfGameManager.isRole(data)) {
                return data;
            }
            return null;
        }).filter((role) => role !== null);
        this.werewolfGameManager.setRoles(args[0], roles);
    }
}
