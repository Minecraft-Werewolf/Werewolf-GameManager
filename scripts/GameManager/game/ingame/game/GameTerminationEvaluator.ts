import type { GameManager } from "./GameManager";
import type { PlayerData } from "./PlayersDataManager";

export enum TerminationReason {
    None,
    Annihilation,
    Timeup,
    VillagerVictory,
    WerewolfVictory,
    FoxesVictory,
}

export class GameTerminationEvaluator {
    private constructor(private readonly gameManager: GameManager) {}
    public static create(gameManager: GameManager): GameTerminationEvaluator {
        return new GameTerminationEvaluator(gameManager);
    }

    public evaluate(playersData: readonly PlayerData[]): TerminationReason {
        const aliveParticipants = playersData.filter((data) => data.isParticipating && data.isAlive);

        if (aliveParticipants.length === 0) {
            return TerminationReason.Annihilation;
        }

        return TerminationReason.None;
    }
}