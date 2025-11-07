import type { WerewolfGameManager } from "../WerewolfGameManager";

export class GamePreparationManager {
    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {}
    public static create(werewolfGameManager: WerewolfGameManager): GamePreparationManager {
        return new GamePreparationManager(werewolfGameManager);
    }

    public async runPreparationAsync(): Promise<void> {

    }
}