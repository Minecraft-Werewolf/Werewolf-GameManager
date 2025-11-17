import { ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { ITEM_USE } from "../../../constants/itemuse";
import { SCRIPT_EVENT_COMMAND_IDS, SCRIPT_EVENT_ID_SUFFIX } from "../../../constants/scriptevent";
import { SCRIPT_EVENT_ID_PREFIX } from "../../../../Kairo/constants/scriptevent";
import { properties } from "../../../../properties";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
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
                KairoUtils.sendKairoCommand(SCRIPT_EVENT_ID_SUFFIX.WEREWOLF_GAMEMANAGER, data);
                break;
        }
    }
}
