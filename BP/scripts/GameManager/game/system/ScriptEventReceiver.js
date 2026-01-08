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
            case SCRIPT_EVENT_COMMAND_IDS.FACTION_REGISTRATION_REQUEST:
                this.systemManager.registerFactions(data.addonId, data.factions);
                break;
            case SCRIPT_EVENT_COMMAND_IDS.FACTION_RE_REGISTRATION_REQUEST:
                this.systemManager.requestFactionReRegistration();
                break;
            case SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_REQUEST:
                this.systemManager.registerRoles(data.addonId, data.roles);
                break;
            case SCRIPT_EVENT_COMMAND_IDS.ROLE_RE_REGISTRATION_REQUEST:
                this.systemManager.requestRoleReRegistration();
                break;
            case SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_ROLE_COMPOSITION:
                this.systemManager.openFormRoleComposition(data.playerId);
                break;
            default:
                break;
        }
    }
}
