import type { GameTerminator } from "./GameTerminator";

export class GameResultPresentation {
    private constructor(private readonly gameTerminator: GameTerminator) {}
    public static create(gameTerminator: GameTerminator): GameResultPresentation {
        return new GameResultPresentation(gameTerminator);
    }

    public async runGameResultPresentaionAsync(): Promise<void> {

    }

    private showGameTerminatedTitle(): void {
        
    }

    private showGameResult(): void {

    }
}