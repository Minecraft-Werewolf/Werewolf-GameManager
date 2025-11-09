import { Player, world } from "@minecraft/server";
import { InitPresentation } from "./InitPresentation";
import { GamePhase, type GameManager } from "../GameManager";
import { CancelableWait } from "../utils/CancelableWait";

export class GameInitializer {
    private readonly initPresentation: InitPresentation;
    private readonly waitController = new CancelableWait();
    private isCancelled = false;

    private constructor(private readonly gameManager: GameManager) {
        this.initPresentation = InitPresentation.create(this);
    }

    public static create(gameManager: GameManager): GameInitializer {
        return new GameInitializer(gameManager);
    }

    public cancel(): void {
        this.isCancelled = true;
        this.waitController.cancel();
    }

    public async runInitializationAsync(): Promise<void> {
        this.gameManager.setCurrentPhase(GamePhase.Initializing);
        this.waitController.reset();
        const players = world.getPlayers();

        try {
            await this.runStep(async () => this.initPresentation.showGameTitle(players));
            await this.runStep(async () => this.initPresentation.cameraBlackoutEffect(players));
            await this.runStep(() => this.teleportPlayers(players));
            await this.runStep(async () => this.initPresentation.showStageTitle(players));
        } catch (e) {
            console.warn(`[GameInitializer] Initialization interrupted: ${String(e)}`);
        }
    }

    private async runStep(stepFn: () => Promise<void> | void): Promise<void> {
        if (this.isCancelled) throw new Error("Initialization cancelled");
        await stepFn();
    }

    public getWaitController(): CancelableWait {
        return this.waitController;
    }

    private teleportPlayers(players: Player[]): void {
        players.forEach((player) => {
            player.teleport(
                { x: 0.5, y: -58.94, z: 24.5 },
                {
                    checkForBlocks: false,
                    dimension: world.getDimension("overworld"),
                    // facingLocation: { x: 0, y: -58, z: 0 }, // rotationを指定しているため不要
                    keepVelocity: false,
                    rotation: { x: 16, y: 180 },
                }
            );
        });
    }
}
