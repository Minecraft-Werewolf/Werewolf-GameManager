import { ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { ITEM_USE } from "../../../constants/itemuse";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { properties } from "../../../../properties";
import type { InGameEventManager } from "./InGameEventManager";
import { KairoUtils, type KairoCommand } from "../../../../Kairo/utils/KairoUtils";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../../constants/systems";

export class InGameItemUseHandler extends BaseEventHandler<ItemUseBeforeEvent, ItemUseAfterEvent> {
    private constructor(private readonly inGameEventManager: InGameEventManager) {
        super(inGameEventManager);
    }

    public static create(inGameEventManager: InGameEventManager): InGameItemUseHandler {
        return new InGameItemUseHandler(inGameEventManager);
    }

    protected beforeEvent = world.beforeEvents.itemUse;
    protected afterEvent = world.afterEvents.itemUse;

    protected handleBefore(ev: ItemUseBeforeEvent): void {
        // 使用前処理
    }

    protected handleAfter(ev: ItemUseAfterEvent): void {
        // 使用後処理
        const { itemStack, source } = ev;

        const data: KairoCommand = {
            commandId: "", // 仮置き
            addonId: properties.id,
        };

        switch (itemStack.typeId) {
            case ITEM_USE.GAME_FORCE_TERMINATOR_ITEM_ID:
                data.commandId = SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_RESET;
                KairoUtils.sendKairoCommand(
                    KAIRO_COMMAND_TARGET_ADDON_IDS.WEREWOLF_GAMEMANAGER,
                    data,
                );
                break;
        }
    }
}
