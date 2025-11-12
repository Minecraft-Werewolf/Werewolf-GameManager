import { GamePhase } from "../../InGameManager";
import { GameResultPresentation } from "./GameResultPresentation";
export class GameTerminator {
    constructor(inGameManager) {
        this.inGameManager = inGameManager;
        this.gameResultPresentation = GameResultPresentation.create(this);
    }
    static create(inGameManager) {
        return new GameTerminator(inGameManager);
    }
    async runTerminationAsync() {
        this.inGameManager.setCurrentPhase(GamePhase.Result);
        console.log("aiueo");
        await this.gameResultPresentation.runGameResultPresentaionAsync();
    }
}
