import { ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { ITEM_USE } from "../../../constants/itemuse";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { properties } from "../../../../properties";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../../constants/systems";
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
                KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.WEREWOLF_GAMEMANAGER, SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_START);
                break;
            case ITEM_USE.GAME_SETTINGS_ITEM_ID:
                this.outGameEventManager.getOutGameManager().openSettingsForm(source);
                break;
            default:
                break;
        }
    }
}
