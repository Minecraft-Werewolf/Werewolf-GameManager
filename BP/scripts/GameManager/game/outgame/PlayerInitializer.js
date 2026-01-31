import { EntityComponentTypes, GameMode, ItemStack } from "@minecraft/server";
import { ITEM_USE } from "../../constants/itemuse";
import { SYSTEMS } from "../../constants/systems";
export class PlayerInitializer {
    constructor(outGameManager) {
        this.outGameManager = outGameManager;
    }
    static create(outGameManager) {
        return new PlayerInitializer(outGameManager);
    }
    initializePlayer(player, isHost) {
        const wantsToJoinNextGame = player.getDynamicProperty("wantsToJoinNextGame") ?? true;
        player.setDynamicProperty("wantsToJoinNextGame", wantsToJoinNextGame);
        // ゲームモード
        player.setGameMode(GameMode.Adventure);
        // インベントリ関連
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return;
        inventory.container.clearAll();
        inventory.container.setItem(SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.PERSONAL_SETTINGS, new ItemStack(ITEM_USE.PERSONAL_SETTINGS_ITEM_ID, 1));
        if (wantsToJoinNextGame)
            inventory.container.setItem(SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_SPECTATE, new ItemStack(ITEM_USE.GAME_SPECTATE_ITEM_ID, 1));
        else
            inventory.container.setItem(SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_JOIN, new ItemStack(ITEM_USE.GAME_JOIN_ITEM_ID, 1));
        if (isHost) {
            inventory.container.setItem(SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_STARTER, new ItemStack(ITEM_USE.GAME_STARTER_ITEM_ID, 1));
            inventory.container.setItem(SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_SETTINGS, new ItemStack(ITEM_USE.GAME_SETTINGS_ITEM_ID, 1));
        }
    }
}
