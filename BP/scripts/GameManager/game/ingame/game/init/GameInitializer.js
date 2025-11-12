import { Player, world } from "@minecraft/server";
import { InitPresentation } from "./InitPresentation";
import { GamePhase } from "../../InGameManager";
import { CancelableWait } from "../../utils/CancelableWait";
export class GameInitializer {
    constructor(inGameManager) {
        this.inGameManager = inGameManager;
        this.waitController = new CancelableWait();
        this._isCancelled = false;
        this.initPresentation = InitPresentation.create(this);
    }
    static create(inGameManager) {
        return new GameInitializer(inGameManager);
    }
    cancel() {
        this._isCancelled = true;
        this.waitController.cancel();
    }
    async runInitializationAsync() {
        this.inGameManager.setCurrentPhase(GamePhase.Initializing);
        this.waitController.reset();
        const players = world.getPlayers();
        await this.initPresentation.runInitPresentationAsync(players);
        this.setPlayersData(players);
    }
    getWaitController() {
        return this.waitController;
    }
    get isCancelled() {
        return this._isCancelled;
    }
    setPlayersData(players) {
        players.forEach((player) => {
            this.inGameManager.getGameManager().getPlayersDataManager().init(player.id);
        });
    }
}
