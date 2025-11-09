import { GamePreparationManager } from "./GamePreparationManager";
import { InGameManager } from "./InGameManager";
import { GameInitializer } from "./init/GameInitializer";
export var GamePhase;
(function (GamePhase) {
    GamePhase[GamePhase["Initializing"] = 0] = "Initializing";
    GamePhase[GamePhase["Preparing"] = 1] = "Preparing";
    GamePhase[GamePhase["InGame"] = 2] = "InGame";
    GamePhase[GamePhase["Result"] = 3] = "Result";
    GamePhase[GamePhase["Waiting"] = 4] = "Waiting";
})(GamePhase || (GamePhase = {}));
export class GameManager {
    constructor() {
        this.currentPhase = GamePhase.Waiting;
        this.gameInitializer = GameInitializer.create(this);
        this.gamePreparatonManager = GamePreparationManager.create(this);
        this.inGameManager = InGameManager.create(this);
    }
    static create() {
        return new GameManager();
    }
    async gameStart() {
        await this.gameInitializer.runInitializationAsync();
        await this.gamePreparatonManager.runPreparationAsync();
        this.inGameManager.startGame();
    }
    gameReset() {
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
    getCurrentPhase() {
        return this.currentPhase;
    }
    setCurrentPhase(phase) {
        this.currentPhase = phase;
    }
}
