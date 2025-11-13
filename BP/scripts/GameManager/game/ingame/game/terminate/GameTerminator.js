import { world } from "@minecraft/server";
import { GamePhase } from "../../InGameManager";
import { CancelableWait } from "../../utils/CancelableWait";
import { GameResultPresentation } from "./GameResultPresentation";
export class GameTerminator {
    constructor(inGameManager) {
        this.inGameManager = inGameManager;
        this.waitController = new CancelableWait();
        this._isCancelled = false;
        this.gameResultPresentation = GameResultPresentation.create(this);
    }
    static create(inGameManager) {
        return new GameTerminator(inGameManager);
    }
    cancel() {
        this._isCancelled = true;
        this.waitController.cancel();
    }
    async runTerminationAsync() {
        this.inGameManager.setCurrentPhase(GamePhase.Result);
        this.waitController.reset();
        const players = world.getPlayers();
        await this.gameResultPresentation.runGameResultPresentaionAsync(players);
    }
    getWaitController() {
        return this.waitController;
    }
    get isCancelled() {
        return this._isCancelled;
    }
    getInGameManager() {
        return this.inGameManager;
    }
}
