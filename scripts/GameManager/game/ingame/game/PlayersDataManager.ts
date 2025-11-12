import type { Player } from "@minecraft/server";
import type { GameManager } from "./GameManager";

export type ParticipationState = "participant" | "spectator";

export class PlayerData {
    public isAlive: boolean = true;

    constructor(public readonly playerId: string, public state: ParticipationState = "participant") {}

    public get isParticipating(): boolean {
        return this.state === "participant";
    }
}

export class PlayersDataManager {
    private dataMap: Map<string, PlayerData> = new Map();

    private constructor(private readonly gameManager: GameManager) {}
    public static create(gameManager: GameManager): PlayersDataManager {
        return new PlayersDataManager(gameManager);
    }

    public init(playerId: string, state: ParticipationState = "participant"): void {
        if (this.dataMap.has(playerId)) return;
        this.dataMap.set(playerId, new PlayerData(playerId, state));
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