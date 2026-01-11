import { EntityComponentTypes, ItemStack } from "@minecraft/server";
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
        if (inventory.container.getItem(9)?.typeId !== "minecraft:arrow") {
            inventory.container.setItem(9, new ItemStack("minecraft:arrow", 1));
        }
    }
}
