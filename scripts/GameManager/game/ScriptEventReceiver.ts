import { SCRIPT_EVENT_COMMAND_IDS } from "../constants";
import type { WerewolfGameManager } from "./WerewolfGameManager";

export class ScriptEventReceiver {
    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {}
    public static create(werewolfGameManager: WerewolfGameManager): ScriptEventReceiver {
        return new ScriptEventReceiver(werewolfGameManager);
    }

    public handleOnScriptEvent(message: string): void {
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