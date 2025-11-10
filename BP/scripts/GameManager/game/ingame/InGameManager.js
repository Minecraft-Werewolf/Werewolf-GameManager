import { GamePhase } from "./GameManager";
import { IntervalManager } from "./utils/IntervalManager";
export class InGameManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.isRunning = false;
        this.resolveFn = null;
        this.rejectFn = null;
        this.onTickUpdate = () => {
            if (!this.isRunning)
                return;
        };
        this.onSecondUpdate = () => {
            if (!this.isRunning)
                return;
        };
        this.intervalManager = IntervalManager.create();
    }
    static create(gameManager) {
        return new InGameManager(gameManager);
    }
    async startGameAsync() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.gameManager.setCurrentPhase(GamePhase.InGame);
        return new Promise((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;
            this.intervalManager.tick.subscribe(this.onTickUpdate);
            this.intervalManager.second.subscribe(this.onSecondUpdate);
            this.intervalManager.startAll();
        });
    }
    stopGame() {
        if (!this.isRunning)
            return;
        this.cleanup();
        this.rejectFn?.(new Error("Game cancelled"));
    }
    finishGame() {
        if (!this.isRunning)
            return;
        this.cleanup();
        this.resolveFn?.();
    }
    cleanup() {
        this.intervalManager.clearAll();
        this.isRunning = false;
        this.resolveFn = null;
        this.rejectFn = null;
    }
}
