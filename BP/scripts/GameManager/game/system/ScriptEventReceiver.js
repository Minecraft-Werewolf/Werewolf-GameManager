import { ConsoleManager } from "../../../Kairo/utils/ConsoleManager";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
export class ScriptEventReceiver {
    constructor(systemManager) {
        this.systemManager = systemManager;
    }
    static create(systemManager) {
        return new ScriptEventReceiver(systemManager);
    }
    handleScriptEvent(data) {
        switch (data.commandId) {
            case SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_START:
                this.systemManager.startGame();
                break;
            case SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_RESET:
                this.systemManager.resetGame();
                break;
            case SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_RESPONSE: {
                const addonId = data.addonId;
                const roles = data.roles;
                if (!addonId || !Array.isArray(roles)) {
                    ConsoleManager.warn(`[ScriptEventReceiver] Invalid ROLE_REGISTRATION_RESPONSE`);
                    return;
                }
                this.systemManager.registerRoles(addonId, roles);
                break;
            }
            default:
                break;
        }
    }
}
