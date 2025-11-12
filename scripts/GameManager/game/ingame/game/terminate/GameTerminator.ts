import { world } from "@minecraft/server";
import { GamePhase, type InGameManager } from "../../InGameManager";
import { CancelableWait } from "../../utils/CancelableWait";
import { GameResultPresentation } from "./GameResultPresentation";

export class GameTerminator {
    private readonly gameResultPresentation: GameResultPresentation;
    private readonly waitController = new CancelableWait();
    private _isCancelled = false;

    private constructor(private readonly inGameManager: InGameManager) {
        this.gameResultPresentation = GameResultPresentation.create(this);
    }
    public static create(inGameManager: InGameManager): GameTerminator {
        return new GameTerminator(inGameManager);
    }

    public cancel(): void {
        this._isCancelled = true;
        this.waitController.cancel();
    }

    public async runTerminationAsync(): Promise<void> {
        this.inGameManager.setCurrentPhase(GamePhase.Result);
        this.waitController.reset();
        const players = world.getPlayers();

        await this.gameResultPresentation.runGameResultPresentaionAsync(players);
    }

    public get isCancelled(): boolean {
        return this._isCancelled;
    }
}