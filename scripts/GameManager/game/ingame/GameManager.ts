import { GamePhase, InGameManager } from "./InGameManager";
import { IntervalManager } from "./utils/IntervalManager";

export class GameManager {
    private readonly intervalManager: IntervalManager;
    private isRunning = false;
    private resolveFn: (() => void) | null = null;
    private rejectFn: ((reason?: any) => void) | null = null;

    private constructor(private readonly inGameManager: InGameManager) {
        this.intervalManager = IntervalManager.create();
    }

    public static create(inGameManager: InGameManager): GameManager {
        return new GameManager(inGameManager);
    }

    public async startGameAsync(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;

        this.inGameManager.setCurrentPhase(GamePhase.InGame);

        return new Promise<void>((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;

            this.intervalManager.tick.subscribe(this.onTickUpdate);
            this.intervalManager.second.subscribe(this.onSecondUpdate);
            this.intervalManager.startAll();
        });
    }

    public stopGame(): void {
        if (!this.isRunning) return;
        this.cleanup();
        this.rejectFn?.(new Error("Game cancelled"));
    }

    public finishGame(): void {
        if (!this.isRunning) return;
        this.cleanup();
        this.resolveFn?.();
    }

    private onTickUpdate = (): void => {
        if (!this.isRunning) return;
    };

    private onSecondUpdate = (): void => {
        if (!this.isRunning) return;
    };

    private cleanup(): void {
        this.intervalManager.clearAll();
        this.isRunning = false;
        this.resolveFn = null;
        this.rejectFn = null;
    }
}
