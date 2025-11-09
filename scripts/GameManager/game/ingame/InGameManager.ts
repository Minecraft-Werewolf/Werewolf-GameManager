import { GamePhase, type GameManager } from "./GameManager";
import { IntervalManager } from "./utils/IntervalManager";

export class InGameManager {
    private readonly intervalManager: IntervalManager;
    private constructor(private readonly gameManager: GameManager) {
        this.intervalManager = IntervalManager.create();
    }
    public static create(gameManager: GameManager): InGameManager {
        return new InGameManager(gameManager);
    }

    public startGame(): void {
        this.gameManager.setCurrentPhase(GamePhase.InGame);

        this.intervalManager.tick.subscribe(this.onTickUpdate);
        this.intervalManager.second.subscribe(this.onSecondUpdate);
        this.intervalManager.startAll();
    }

    private onTickUpdate = (): void => {

    }

    private onSecondUpdate = (): void => {
    }
}