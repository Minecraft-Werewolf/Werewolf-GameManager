import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
export class ScriptEventReceiver {
    constructor(systemManager) {
        this.systemManager = systemManager;
    }
    static create(systemManager) {
        return new ScriptEventReceiver(systemManager);
    }
    handleScriptEvent(data) {
        console.log(data);
        switch (data.commandId) {
            case SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_START:
                this.systemManager.startGame();
                break;
            case SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_RESET:
                this.systemManager.resetGame();
                break;
            case SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_RESPONSE:
                this.systemManager.registerRoles(data.addonId, data.roles);
                break;
            case SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_ROLE_ASSIGNMENT:
                this.systemManager.openFormRoleAssignment(data.playerId);
                break;
            default:
                break;
        }
    }
}
