import { GamePreparationManager } from "./GamePreparationManager";
import { InGameManager } from "./InGameManager";
import { GameInitializer } from "./init/GameInitializer";

export enum GamePhase {
    Initializing,
    Preparing,
    InGame,
    Result,
    Waiting,
}

export class GameManager {
    private currentPhase: GamePhase = GamePhase.Waiting;

    private gameInitializer: GameInitializer;
    private gamePreparatonManager: GamePreparationManager;
    private inGameManager: InGameManager;

    private constructor() {
        this.gameInitializer = GameInitializer.create(this);
        this.gamePreparatonManager = GamePreparationManager.create(this);
        this.inGameManager = InGameManager.create(this);
    }
    public static create(): GameManager {
        return new GameManager();
    }

    public async gameStart(): Promise<void> {
        await this.gameInitializer.runInitializationAsync();
        await this.gamePreparatonManager.runPreparationAsync();

        this.inGameManager.startGame();
    }

    public gameReset(): void {
        switch (this.currentPhase) {
            case GamePhase.Initializing:
                break;
            case GamePhase.Preparing:
                break;
            case GamePhase.InGame:
                break;
            case GamePhase.Result:
                break;
            case GamePhase.Waiting:
                break;
            default: break;
        }
    }

    public getCurrentPhase(): GamePhase {
        return this.currentPhase;
    }

    public setCurrentPhase(phase: GamePhase): void {
        this.currentPhase = phase;
    }
}