import { EntityComponentTypes, ItemStack } from "@minecraft/server";
import { ITEM_USE } from "../../../../constants/itemuse";
export class ItemManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }
    static create(gameManager) {
        return new ItemManager(gameManager);
    }
    replaceItemToPlayers(players) {
        players.forEach((player) => {
            this.replaceItemToPlayer(player);
        });
    }
    replaceItemToPlayer(player) {
        const playerData = this.gameManager.getPlayerData(player.id);
        if (!playerData)
            return;
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return;
        if (inventory.container.getItem(0)?.typeId !== "minecraft:bow") {
            inventory.container.setItem(0, new ItemStack("minecraft:bow", 1));
        }
        if (inventory.container.getItem(8)?.typeId !== ITEM_USE.SKILL_TRIGGER_ITEM_ID) {
            inventory.container.setItem(8, new ItemStack(ITEM_USE.SKILL_TRIGGER_ITEM_ID, 1));
        }
        if (inventory.container.getItem(9)?.typeId !== "minecraft:arrow") {
            inventory.container.setItem(9, new ItemStack("minecraft:arrow", 1));
        }
        if (inventory.container.getItem(17)?.typeId !== ITEM_USE.GAME_FORCE_TERMINATOR_ITEM_ID) {
            inventory.container.setItem(17, new ItemStack(ITEM_USE.GAME_FORCE_TERMINATOR_ITEM_ID, 1));
        }
    }
}
