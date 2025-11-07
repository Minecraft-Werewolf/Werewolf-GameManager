import { system, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import { BaseEventHandler } from "./BaseEventHandler";
import type { EventManager } from "./EventManager";
import { SCRIPT_EVENT_IDS } from "../../constants/scriptevent";

export class ScriptEventReceiveHandler extends BaseEventHandler<undefined, ScriptEventCommandMessageAfterEvent> {
    public static create(eventManager: EventManager): ScriptEventReceiveHandler {
        return new ScriptEventReceiveHandler(eventManager);
    }

    protected afterEvent = system.afterEvents.scriptEventReceive;

    protected handleAfter(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, initiator, message, sourceBlock, sourceEntity, sourceType } = ev;

        switch (id) {
            case SCRIPT_EVENT_IDS.WEREWOLF_GAME_START:
                this.eventManager.getWerewolfGameManager().gameInitialization();
                break;
        }
    }
}