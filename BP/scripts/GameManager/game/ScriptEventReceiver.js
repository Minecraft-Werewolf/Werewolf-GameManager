import { SCRIPT_EVENT_COMMAND_IDS } from "../constants";
export class ScriptEventReceiver {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
    }
    static create(werewolfGameManager) {
        return new ScriptEventReceiver(werewolfGameManager);
    }
    handleOnScriptEvent(message) {
        const command = message.split(" ")[0];
        const args = message.split(" ").slice(1).join("").split(",");
        switch (command) {
            case SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION:
                // registrationRoles(addonId: string, roles: Role[])
                this.werewolfGameManager.registrationRoles(args);
                break;
            default:
                break;
        }
    }
}
