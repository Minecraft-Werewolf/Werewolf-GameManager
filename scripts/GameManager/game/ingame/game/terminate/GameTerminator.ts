import { GamePhase, type InGameManager } from "../../InGameManager";
import { GameResultPresentation } from "./GameResultPresentation";

export class GameTerminator {
    private readonly gameResultPresentation: GameResultPresentation;
    private constructor(private readonly inGameManager: InGameManager) {
        this.gameResultPresentation = GameResultPresentation.create(this);
    }
    public static create(inGameManager: InGameManager): GameTerminator {
        return new GameTerminator(inGameManager);
    }

    public async runTerminationAsync(): Promise<void> {
        this.inGameManager.setCurrentPhase(GamePhase.Result);

        await this.gameResultPresentation.runGameResultPresentaionAsync();
    }
}