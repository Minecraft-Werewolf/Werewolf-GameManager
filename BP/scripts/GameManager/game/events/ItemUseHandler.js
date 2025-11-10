import { ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";
import { BaseEventHandler } from "./BaseEventHandler";
import { ITEM_USE } from "../../constants/itemuse";
import { SCRIPT_EVENT_IDS, SCRIPT_EVENT_MESSAGES } from "../../constants/scriptevent";
export class ItemUseHandler extends BaseEventHandler {
    constructor(systemEventManager) {
        super(systemEventManager);
        this.systemEventManager = systemEventManager;
        this.beforeEvent = world.beforeEvents.itemUse;
        this.afterEvent = world.afterEvents.itemUse;
    }
    static create(systemEventManager) {
        return new ItemUseHandler(systemEventManager);
    }
    handleBefore(ev) {
        // 使用前処理
    }
    handleAfter(ev) {
        // 使用後処理
        const { itemStack, source } = ev;
        switch (itemStack.typeId) {
            case ITEM_USE.GAME_START_ITEM_ID:
                system.sendScriptEvent(SCRIPT_EVENT_IDS.WEREWOLF_GAME_START, SCRIPT_EVENT_MESSAGES.NONE);
                break;
        }
    }
}
