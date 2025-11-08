import { world } from "@minecraft/server";
import { InitPresentation } from "./InitPresentation";
export class GameInitializer {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.initPresentation = InitPresentation.create(this);
    }
    static create(systemManager) {
        return new GameInitializer(systemManager);
    }
    async runInitializationAsync() {
        const players = world.getPlayers();
        await this.initPresentation.showGameTitle(players);
        await this.initPresentation.cameraBlackoutEffect(players);
        this.initPresentation.teleportPlayers(players);
        await this.initPresentation.showStageTitle(players);
        this.systemManager.gamePreparation();
    }
}
