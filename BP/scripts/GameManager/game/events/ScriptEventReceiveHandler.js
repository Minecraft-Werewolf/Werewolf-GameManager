import { system } from "@minecraft/server";
import { BaseEventHandler } from "./BaseEventHandler";
import { SCRIPT_EVENT_IDS } from "../../constants/scriptevent";
export class ScriptEventReceiveHandler extends BaseEventHandler {
    constructor(systemEventManager) {
        super(systemEventManager);
        this.systemEventManager = systemEventManager;
        this.afterEvent = system.afterEvents.scriptEventReceive;
    }
    static create(systemEventManager) {
        return new ScriptEventReceiveHandler(systemEventManager);
    }
    handleAfter(ev) {
        const { id, initiator, message, sourceBlock, sourceEntity, sourceType } = ev;
        switch (id) {
            case SCRIPT_EVENT_IDS.WEREWOLF_GAME_START:
                this.systemEventManager.getSystemManager().gameStart();
                break;
            case SCRIPT_EVENT_IDS.WEREWOLF_GAME_RESET:
                this.systemEventManager.getSystemManager().gameReset();
                break;
        }
    }
}
