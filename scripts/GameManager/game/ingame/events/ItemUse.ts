import { ItemUseAfterEvent, ItemUseBeforeEvent, system, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { ITEM_USE } from "../../../constants/itemuse";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { properties } from "../../../../properties";
import type { InGameEventManager } from "./InGameEventManager";
import { KairoUtils, type KairoCommand } from "../../../../Kairo/utils/KairoUtils";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../../constants/systems";
import type { GameEventType } from "../../../data/roles";

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

        switch (itemStack.typeId) {
            case ITEM_USE.GAME_FORCE_TERMINATOR_ITEM_ID:
                KairoUtils.sendKairoCommand(
                    KAIRO_COMMAND_TARGET_ADDON_IDS.WEREWOLF_GAMEMANAGER,
                    SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_RESET,
                );
                break;
            case ITEM_USE.SKILL_TRIGGER_ITEM_ID:
                const player = source;
                const playerData = this.inGameEventManager
                    .getInGameManager()
                    .getPlayerData(player.id);
                if (!playerData) return;

                KairoUtils.sendKairoCommand(
                    playerData.role?.providerAddonId ?? "",
                    SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_INGAME_PLAYER_SKILL_TRIGGER,
                    {
                        playerId: player.id,
                        eventType: "ItemUse" satisfies GameEventType,
                    },
                );
                break;
        }
    }
}
