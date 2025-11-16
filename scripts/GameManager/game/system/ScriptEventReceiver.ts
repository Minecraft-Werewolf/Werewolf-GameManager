import { ConsoleManager } from "../../../Kairo/utils/ConsoleManager";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
import type { SystemManager } from "../SystemManager";

export interface KairoCommand {
    commandId: string;
    addonId: string;
    [key: string]: any;
}

export class ScriptEventReceiver {
    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): ScriptEventReceiver {
        return new ScriptEventReceiver(systemManager);
    }

    public handleScriptEvent(message: string): void {
        let data: any;

        try {
            data = JSON.parse(message);
        } catch {
            ConsoleManager.warn(`[ScriptEventReceiver] Invalid JSON: ${message}`);
            return;
        }

        if (!data || typeof data.commandId !== "string") {
            ConsoleManager.warn(`[ScriptEventReceiver] Missing command: ${message}`);
            return;
        }

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
