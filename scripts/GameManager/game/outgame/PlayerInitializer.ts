import { EntityComponentTypes, ItemStack, type Player } from "@minecraft/server";
import type { OutGameManager } from "./OutGameManager";
import { ITEM_USE } from "../../constants/itemuse";
import { SYSTEMS } from "../../constants/systems";

export class PlayerInitializer {
    private constructor(private readonly outGameManager: OutGameManager) {}
    public static create(outGameManager: OutGameManager) {
        return new PlayerInitializer(outGameManager);
    }

    public initializePlayer(player: Player): void {
        const wantsToJoinNextGame = player.getDynamicProperty("wantsToJoinNextGame") ?? true;
        player.setDynamicProperty("wantsToJoinNextGame", wantsToJoinNextGame);

        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory) return;

        inventory.container.clearAll();
        inventory.container.setItem(
            SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.PERSONAL_SETTINGS,
            new ItemStack(ITEM_USE.PERSONAL_SETTINGS_ITEM_ID, 1),
        );

        if (wantsToJoinNextGame)
            inventory.container.setItem(
                SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_SPECTATE,
                new ItemStack(ITEM_USE.GAME_SPECTATE_ITEM_ID, 1),
            );
        else
            inventory.container.setItem(
                SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_JOIN,
                new ItemStack(ITEM_USE.GAME_JOIN_ITEM_ID, 1),
            );

        // ホスト機能作るまでは、ホスト専用アイテムも全員に配っちゃう (デバッグがだるい)
        inventory.container.setItem(
            SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_STARTER,
            new ItemStack(ITEM_USE.GAME_STARTER_ITEM_ID, 1),
        );

        inventory.container.setItem(
            SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_SETTINGS,
            new ItemStack(ITEM_USE.GAME_SETTINGS_ITEM_ID, 1),
        );
    }
}
