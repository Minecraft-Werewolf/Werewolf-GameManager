import type { SystemManager } from "../SystemManager";
import { OutGameEventManager } from "./events/OutGameEventManager";

export class OutGameManager {
    private readonly outGameEventManager: OutGameEventManager;
    private constructor(private readonly systemManager: SystemManager) {
        this.outGameEventManager = OutGameEventManager.create(this);
    }
    public static create(systemManager: SystemManager): OutGameManager {
        return new OutGameManager(systemManager);
    }

    public startGame(): void {
        this.systemManager.startGame();
    }

    public getOutGameEventManager(): OutGameEventManager {
        return this.outGameEventManager;
    }
}