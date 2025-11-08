import { world } from "@minecraft/server";
import type { SystemManager } from "../../SystemManager";
import { InitPresentation } from "./InitPresentation";

export class GameInitializer {
    private readonly initPresentation: InitPresentation

    private constructor(private readonly systemManager: SystemManager) {
        this.initPresentation = InitPresentation.create(this);
    }
    public static create(systemManager: SystemManager): GameInitializer {
        return new GameInitializer(systemManager);
    }

    public async runInitializationAsync(): Promise<void> {
        const players = world.getPlayers();
        await this.initPresentation.showGameTitle(players);
        await this.initPresentation.cameraBlackoutEffect(players);
        this.initPresentation.teleportPlayers(players);
        await this.initPresentation.showStageTitle(players);
        this.systemManager.gamePreparation();
    }
}