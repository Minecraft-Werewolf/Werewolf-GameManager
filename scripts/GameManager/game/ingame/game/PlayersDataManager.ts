import type { Player } from "@minecraft/server";
import type { InGameManager } from "../InGameManager";
import { PlayerData, type ParticipationState } from "./PlayerData";

export class PlayersDataManager {
    private dataMap: Map<string, PlayerData> = new Map();

    private constructor(private readonly inGameManager: InGameManager) {}
    public static create(inGameManager: InGameManager): PlayersDataManager {
        return new PlayersDataManager(inGameManager);
    }

    public init(player: Player, state: ParticipationState = "participant"): void {
        if (this.dataMap.has(player.id)) return;
        this.dataMap.set(player.id, new PlayerData(this, player, state));
    }

    public get(playerId: string): PlayerData {
        return this.dataMap.get(playerId)!;
    }

    public getByPlayer(player: Player): PlayerData | undefined {
        return this.dataMap.get(player.id);
    }

    public getPlayersData(): readonly PlayerData[] {
        return Array.from(this.dataMap.values());
    }

    public remove(playerId: string): void {
        this.dataMap.delete(playerId);
    }

    public clearAll(): void {
        this.dataMap.clear();
    }
}
