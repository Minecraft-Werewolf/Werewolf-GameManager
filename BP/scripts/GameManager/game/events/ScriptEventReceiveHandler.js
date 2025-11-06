import { system } from "@minecraft/server";
import { BaseEventHandler } from "./BaseEventHandler";
import { SCRIPT_EVENT_IDS } from "../../constants";
export class ScriptEventReceiveHandler extends BaseEventHandler {
    constructor() {
        super(...arguments);
        this.afterEvent = system.afterEvents.scriptEventReceive;
    }
    static create(eventManager) {
        return new ScriptEventReceiveHandler(eventManager);
    }
    handleAfter(ev) {
        const { id, initiator, message, sourceBlock, sourceEntity, sourceType } = ev;
        switch (id) {
            case SCRIPT_EVENT_IDS.WEREWOLF_GAME_START:
                this.eventManager.getWerewolfGameManager().gameInitialize();
                break;
        }
    }
}
