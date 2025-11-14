import { system, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import type { OutGameEventManager } from "./OutGameEventManager";
import { SCRIPT_EVENT_IDS } from "../../../constants/scriptevent";

export class OutGameScriptEventReceiveHandler extends BaseEventHandler<
    undefined,
    ScriptEventCommandMessageAfterEvent
> {
    private constructor(private readonly outGameEventManager: OutGameEventManager) {
        super(outGameEventManager);
    }
    public static create(
        outGameEventManager: OutGameEventManager,
    ): OutGameScriptEventReceiveHandler {
        return new OutGameScriptEventReceiveHandler(outGameEventManager);
    }

    protected afterEvent = system.afterEvents.scriptEventReceive;

    protected handleAfter(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, initiator, message, sourceBlock, sourceEntity, sourceType } = ev;

        switch (id) {
            case SCRIPT_EVENT_IDS.WEREWOLF_GAME_START:
                this.outGameEventManager.getOutGameManager().startGame();
                break;
        }
    }
}
