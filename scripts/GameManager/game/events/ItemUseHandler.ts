import { ItemUseAfterEvent, ItemUseBeforeEvent, world } from "@minecraft/server";
import type { EventManager } from "./EventManager";

export class ItemUseHandler {
    private constructor(private readonly eventManager: EventManager) {}

    public static create(eventManager: EventManager): ItemUseHandler {
        return new ItemUseHandler(eventManager);
    }

    public subscribe(): void {
        world.afterEvents.itemUse.subscribe(this.handleItemUseAfterEvent);
        world.beforeEvents.itemUse.subscribe(this.handleItemUseBeforeEvent);
    }

    public unsubscribe(): void {
        world.afterEvents.itemUse.unsubscribe(this.handleItemUseAfterEvent);
        world.beforeEvents.itemUse.unsubscribe(this.handleItemUseBeforeEvent);
    }

    private handleItemUseBeforeEvent = (ev: ItemUseBeforeEvent): void => {
        // アイテム使用前の処理
    }

    private handleItemUseAfterEvent = (ev: ItemUseAfterEvent): void => {
        // アイテム使用後の処理
    }
}