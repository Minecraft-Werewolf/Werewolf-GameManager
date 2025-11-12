export class GameResultPresentation {
    constructor(gameTerminator) {
        this.gameTerminator = gameTerminator;
    }
    static create(gameTerminator) {
        return new GameResultPresentation(gameTerminator);
    }
    async runGameResultPresentaionAsync() {
    }
    showGameTerminatedTitle() {
    }
    showGameResult() {
    }
}
