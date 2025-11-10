import { system } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { InGameEventManager } from "./InGameEventManager";
import { SCRIPT_EVENT_IDS } from "../../../constants/scriptevent";
export class InGameScriptEventReceiveHandler extends BaseEventHandler {
    constructor(inGameEventManager) {
        super(inGameEventManager);
        this.inGameEventManager = inGameEventManager;
        this.afterEvent = system.afterEvents.scriptEventReceive;
    }
    static create(inGameEventManager) {
        return new InGameScriptEventReceiveHandler(inGameEventManager);
    }
    handleAfter(ev) {
        const { id, initiator, message, sourceBlock, sourceEntity, sourceType } = ev;
        switch (id) {
            case SCRIPT_EVENT_IDS.WEREWOLF_GAME_RESET:
                this.inGameEventManager.getInGameManager().gameReset();
                break;
        }
    }
}
