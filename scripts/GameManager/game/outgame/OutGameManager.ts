import type { SystemManager } from "../SystemManager";

export class OutGameManager {
    private constructor(private readonly systemManager: SystemManager) {

    }
    public static create(systemManager: SystemManager): OutGameManager {
        return new OutGameManager(systemManager);
    }

    public gameStart(): void {
        this.systemManager.gameStart();
    }
}