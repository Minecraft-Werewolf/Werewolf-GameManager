import { world } from "@minecraft/server";
import type { WerewolfGameManager } from "../../WerewolfGameManager";
import { InitPresentation } from "./InitPresentation";

export class GameInitializer {
    private readonly initPresentation: InitPresentation

    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {
        this.initPresentation = InitPresentation.create(this);
    }
    public static create(werewolfGameManager: WerewolfGameManager): GameInitializer {
        return new GameInitializer(werewolfGameManager);
    }

    public async runInitializationAsync(): Promise<void> {
        const players = world.getPlayers();
        await this.initPresentation.showGameTitle(players);
        await this.initPresentation.cameraBlackoutEffect(players);
        await this.initPresentation.showStageTitle(players);
        this.werewolfGameManager.gamePreparation();
    }
}