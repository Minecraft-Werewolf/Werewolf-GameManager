import { Player, world } from "@minecraft/server";
import { InitPresentation } from "./InitPresentation";
import { GamePhase } from "../GameManager";
import { CancelableWait } from "../utils/CancelableWait";
export class GameInitializer {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.waitController = new CancelableWait();
        this.isCancelled = false;
        this.initPresentation = InitPresentation.create(this);
    }
    static create(gameManager) {
        return new GameInitializer(gameManager);
    }
    cancel() {
        this.isCancelled = true;
        this.waitController.cancel();
    }
    async runInitializationAsync() {
        this.gameManager.setCurrentPhase(GamePhase.Initializing);
        this.waitController.reset();
        const players = world.getPlayers();
        try {
            await this.runStep(async () => this.initPresentation.showGameTitle(players));
            await this.runStep(async () => this.initPresentation.cameraBlackoutEffect(players));
            await this.runStep(() => this.teleportPlayers(players));
            await this.runStep(async () => this.initPresentation.showStageTitle(players));
        }
        catch (e) {
            console.warn(`[GameInitializer] Initialization interrupted: ${String(e)}`);
        }
    }
    async runStep(stepFn) {
        if (this.isCancelled)
            throw new Error("Initialization cancelled");
        await stepFn();
    }
    getWaitController() {
        return this.waitController;
    }
    teleportPlayers(players) {
        players.forEach((player) => {
            player.teleport({ x: 0.5, y: -58.94, z: 24.5 }, {
                checkForBlocks: false,
                dimension: world.getDimension("overworld"),
                // facingLocation: { x: 0, y: -58, z: 0 }, // rotationを指定しているため不要
                keepVelocity: false,
                rotation: { x: 16, y: 180 },
            });
        });
    }
}
