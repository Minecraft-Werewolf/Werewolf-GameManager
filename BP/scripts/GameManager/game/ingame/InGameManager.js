import { GamePhase } from "./GameManager";
import { IntervalManager } from "./utils/IntervalManager";
export class InGameManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.onTickUpdate = () => {
        };
        this.onSecondUpdate = () => {
        };
        this.intervalManager = IntervalManager.create();
    }
    static create(gameManager) {
        return new InGameManager(gameManager);
    }
    startGame() {
        this.gameManager.setCurrentPhase(GamePhase.InGame);
        this.intervalManager.tick.subscribe(this.onTickUpdate);
        this.intervalManager.second.subscribe(this.onSecondUpdate);
        this.intervalManager.startAll();
    }
}
