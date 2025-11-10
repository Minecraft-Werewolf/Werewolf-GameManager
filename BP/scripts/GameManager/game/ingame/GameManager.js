import { GamePhase, InGameManager } from "./InGameManager";
import { IntervalManager } from "./utils/IntervalManager";
export class GameManager {
    constructor(inGameManager) {
        this.inGameManager = inGameManager;
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
    static create(inGameManager) {
        return new GameManager(inGameManager);
    }
    async startGameAsync() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.inGameManager.setCurrentPhase(GamePhase.InGame);
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
