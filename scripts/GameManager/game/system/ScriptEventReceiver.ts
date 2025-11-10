import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
import type { SystemManager } from "../SystemManager";

export class ScriptEventReceiver {
    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): ScriptEventReceiver {
        return new ScriptEventReceiver(systemManager);
    }

    public handleOnScriptEvent(message: string): void {
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