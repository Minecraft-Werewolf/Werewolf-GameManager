import { world } from "@minecraft/server";
import { InitPresentation } from "./InitPresentation";
export class GameInitializer {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
        this.initPresentation = InitPresentation.create(this);
    }
    static create(werewolfGameManager) {
        return new GameInitializer(werewolfGameManager);
    }
    async runInitializationAsync() {
        const players = world.getPlayers();
        await this.initPresentation.showGameTitle(players);
        await this.initPresentation.cameraBlackoutEffect(players);
        await this.initPresentation.showStageTitle(players);
        this.werewolfGameManager.gamePreparation();
    }
}
