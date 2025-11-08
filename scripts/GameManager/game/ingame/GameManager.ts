import type { SystemManager } from "../SystemManager";
import { IntervalManager } from "./utils/IntervalManager";

export class GameManager {
    private readonly intervalManager: IntervalManager;
    private constructor(private readonly systemManager: SystemManager) {
        this.intervalManager = IntervalManager.create();
    }
    public static create(systemManager: SystemManager): GameManager {
        return new GameManager(systemManager);
    }

    public startGame(): void {
        this.intervalManager.tick.subscribe(this.onTickUpdate);
        this.intervalManager.second.subscribe(this.onSecondUpdate);
        this.intervalManager.startAll();
    }

    private onTickUpdate = (): void => {

    }

    private onSecondUpdate = (): void => {

    }
}