import { SCRIPT_EVENT_COMMAND_IDS } from "../constants/scriptevent";
export class ScriptEventReceiver {
    constructor(systemManager) {
        this.systemManager = systemManager;
    }
    static create(systemManager) {
        return new ScriptEventReceiver(systemManager);
    }
    handleOnScriptEvent(message) {
        const command = message.split(" ")[0];
        const args = message.split(" ").slice(1).join("").split(",");
        switch (command) {
            case SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION:
                // registrationRoles(addonId: string, roles: Role[])
                this.systemManager.registrationRoles(args);
                break;
            default:
                break;
        }
    }
}
