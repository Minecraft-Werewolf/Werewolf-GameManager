import { ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";
import type { EventManager } from "./EventManager";
import { ITEM_USE, SCRIPT_EVENT_IDS, SCRIPT_EVENT_MESSAGES } from "../../constants";
import { BaseEventHandler } from "./BaseEventHandler";

export class ItemUseHandler extends BaseEventHandler<ItemUseBeforeEvent, ItemUseAfterEvent> {
    public static create(eventManager: EventManager): ItemUseHandler {
        return new ItemUseHandler(eventManager);
    }

    protected beforeEvent = world.beforeEvents.itemUse;
    protected afterEvent = world.afterEvents.itemUse;

    protected handleBefore(ev: ItemUseBeforeEvent): void {
        // 使用前処理
    }

    protected handleAfter(ev: ItemUseAfterEvent): void {
        // 使用後処理
        const { itemStack, source } = ev;

        switch (itemStack.typeId) {
            case ITEM_USE.GAME_START_ITEM_ID:
                system.sendScriptEvent(SCRIPT_EVENT_IDS.WEREWOLF_GAME_START, SCRIPT_EVENT_MESSAGES.NONE);
                break;
        }
    }
}
