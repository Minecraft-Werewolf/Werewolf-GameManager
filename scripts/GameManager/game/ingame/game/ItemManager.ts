import type { Player } from "@minecraft/server";
import type { GameManager } from "./GameManager";

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

    public replaceItemToPlayers(players: Player[]): void {}
}
