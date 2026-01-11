import { EntityComponentTypes, ItemStack, type Player } from "@minecraft/server";
import type { GameManager } from "../GameManager";

export interface InGameItem {
    typeId: string;
    slot: number;
    amount: number;
    dataValues?: number;
    enchantments?: Record<string, number>;
    holdingEffects?: string[];
}

export class ItemManager {
    private constructor(private readonly gameManager: GameManager) {}
    public static create(gameManager: GameManager): ItemManager {
        return new ItemManager(gameManager);
    }

    public replaceItemToPlayers(players: Player[]): void {
        players.forEach((player) => {
            this.replaceItemToPlayer(player);
        });
    }

    private replaceItemToPlayer(player: Player): void {
        const playerData = this.gameManager.getPlayerData(player.id);
        if (!playerData) return;

        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory) return;

        if (inventory.container.getItem(0)?.typeId !== "minecraft:bow") {
            inventory.container.setItem(0, new ItemStack("minecraft:bow", 1));
        }

        if (inventory.container.getItem(9)?.typeId !== "minecraft:arrow") {
            inventory.container.setItem(9, new ItemStack("minecraft:arrow", 1));
        }
    }
}
