import { system, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import { InGameEventManager } from "./InGameEventManager";
import { SCRIPT_EVENT_IDS } from "../../../constants/scriptevent";
import { BaseEventHandler } from "../../events/BaseEventHandler";

export class InGameScriptEventReceiveHandler extends BaseEventHandler<
    undefined,
    ScriptEventCommandMessageAfterEvent
> {
    private constructor(private readonly inGameEventManager: InGameEventManager) {
        super(inGameEventManager);
    }
    public static create(inGameEventManager: InGameEventManager): InGameScriptEventReceiveHandler {
        return new InGameScriptEventReceiveHandler(inGameEventManager);
    }

    protected afterEvent = system.afterEvents.scriptEventReceive;

    protected handleAfter(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, initiator, message, sourceBlock, sourceEntity, sourceType } = ev;

        switch (id) {
            case SCRIPT_EVENT_IDS.WEREWOLF_GAME_RESET:
                this.inGameEventManager.getInGameManager().gameReset();
                break;
        }
    }
}
