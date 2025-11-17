import { ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import type { OutGameEventManager } from "./OutGameEventManager";
import { ITEM_USE } from "../../../constants/itemuse";
import { SCRIPT_EVENT_COMMAND_IDS, SCRIPT_EVENT_ID_SUFFIX } from "../../../constants/scriptevent";
import { SCRIPT_EVENT_ID_PREFIX } from "../../../../Kairo/constants/scriptevent";
import { properties } from "../../../../properties";
import { KairoUtils, type KairoCommand } from "../../../../Kairo/utils/KairoUtils";

export class OutGameItemUseHandler extends BaseEventHandler<ItemUseBeforeEvent, ItemUseAfterEvent> {
    private constructor(private readonly outGameEventManager: OutGameEventManager) {
        super(outGameEventManager);
    }

    public static create(outGameEventManager: OutGameEventManager): OutGameItemUseHandler {
        return new OutGameItemUseHandler(outGameEventManager);
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
            case ITEM_USE.GAME_STARTER_ITEM_ID:
                data.commandId = SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_START;
                KairoUtils.sendKairoCommand(SCRIPT_EVENT_ID_SUFFIX.WEREWOLF_GAMEMANAGER, data);
                break;
            case ITEM_USE.GAME_SETTINGS_ITEM_ID:
                this.outGameEventManager.getOutGameManager().openSettingsForm(source);
                break;
            default:
                break;
        }
    }
}
