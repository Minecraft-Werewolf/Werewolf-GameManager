import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
import type { SystemManager } from "../SystemManager";

export class ScriptEventReceiver {
    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): ScriptEventReceiver {
        return new ScriptEventReceiver(systemManager);
    }

    public handleScriptEvent(message: string): void {
        const command = message.split(" ")[0];
        const args = message.split(" ").slice(1).join("").split(",");

        switch (command) {
            case SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_START:
                this.systemManager.startGame();
                break;
            case SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_RESET:
                this.systemManager.resetGame();
                break;
            case SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION:
                // registrationRoles(addonId: string, roles: Role[])
                this.systemManager.registerRoles(args);
                break;
            default:
                break;
        }
    }
}
