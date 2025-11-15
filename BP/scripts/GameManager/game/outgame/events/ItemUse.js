import { ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { ITEM_USE } from "../../../constants/itemuse";
import { SCRIPT_EVENT_IDS, SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";
export class OutGameItemUseHandler extends BaseEventHandler {
    constructor(outGameEventManager) {
        super(outGameEventManager);
        this.outGameEventManager = outGameEventManager;
        this.beforeEvent = world.beforeEvents.itemUse;
        this.afterEvent = world.afterEvents.itemUse;
    }
    static create(outGameEventManager) {
        return new OutGameItemUseHandler(outGameEventManager);
    }
    handleBefore(ev) {
        // 使用前処理
    }
    handleAfter(ev) {
        // 使用後処理
        const { itemStack, source } = ev;
        switch (itemStack.typeId) {
            case ITEM_USE.GAME_STARTER_ITEM_ID:
                system.sendScriptEvent(SCRIPT_EVENT_IDS.WEREWOLF_GAME_START, SCRIPT_EVENT_MESSAGES.NONE);
                break;
        }
    }
}
