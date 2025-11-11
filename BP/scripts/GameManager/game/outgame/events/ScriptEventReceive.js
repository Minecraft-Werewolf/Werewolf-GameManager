import { system } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { SCRIPT_EVENT_IDS } from "../../../constants/scriptevent";
export class OutGameScriptEventReceiveHandler extends BaseEventHandler {
    constructor(outGameEventManager) {
        super(outGameEventManager);
        this.outGameEventManager = outGameEventManager;
        this.afterEvent = system.afterEvents.scriptEventReceive;
    }
    static create(outGameEventManager) {
        return new OutGameScriptEventReceiveHandler(outGameEventManager);
    }
    handleAfter(ev) {
        const { id, initiator, message, sourceBlock, sourceEntity, sourceType } = ev;
        switch (id) {
            case SCRIPT_EVENT_IDS.WEREWOLF_GAME_START:
                this.outGameEventManager.getOutGameManager().startGame();
                break;
        }
    }
}
