import type { WerewolfGameManager } from "../WerewolfGameManager";

export class GameInitializer {
    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {}
    public static create(werewolfGameManager: WerewolfGameManager): GameInitializer {
        return new GameInitializer(werewolfGameManager);
    }

    public initialize(): void {
        
    }
}