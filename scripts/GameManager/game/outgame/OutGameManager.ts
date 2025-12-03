import { system, world, type Player } from "@minecraft/server";
import type { SystemManager } from "../SystemManager";
import { OutGameEventManager } from "./events/OutGameEventManager";
import { PlayerInitializer } from "./PlayerInitializer";

export class OutGameManager {
    private readonly outGameEventManager: OutGameEventManager;
    private readonly playerInitializer: PlayerInitializer;
    private constructor(private readonly systemManager: SystemManager) {
        this.outGameEventManager = OutGameEventManager.create(this);
        this.playerInitializer = PlayerInitializer.create(this);
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

    public initializePlayer(player: Player): void {
        this.playerInitializer.initializePlayer(player);
    }

    public openSettingsForm(player: Player): void {
        this.systemManager.openSettingsForm(player);
    }
}
