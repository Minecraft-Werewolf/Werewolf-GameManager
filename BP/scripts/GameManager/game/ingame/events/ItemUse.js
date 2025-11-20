import { ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { ITEM_USE } from "../../../constants/itemuse";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { properties } from "../../../../properties";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../../constants/systems";
export class InGameItemUseHandler extends BaseEventHandler {
    constructor(inGameEventManager) {
        super(inGameEventManager);
        this.inGameEventManager = inGameEventManager;
        this.beforeEvent = world.beforeEvents.itemUse;
        this.afterEvent = world.afterEvents.itemUse;
    }
    static create(inGameEventManager) {
        return new InGameItemUseHandler(inGameEventManager);
    }
    handleBefore(ev) {
        // 使用前処理
    }
    handleAfter(ev) {
        // 使用後処理
        const { itemStack, source } = ev;
        const data = {
            commandId: "", // 仮置き
            addonId: properties.id,
        };
        switch (itemStack.typeId) {
            case ITEM_USE.GAME_FORCE_TERMINATOR_ITEM_ID:
                data.commandId = SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_RESET;
                KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.WEREWOLF_GAMEMANAGER, data);
                break;
        }
    }
}
