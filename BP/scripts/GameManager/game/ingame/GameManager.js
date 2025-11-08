import { IntervalManager } from "./utils/IntervalManager";
export class GameManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.onTickUpdate = () => {
        };
        this.onSecondUpdate = () => {
        };
        this.intervalManager = IntervalManager.create();
    }
    static create(systemManager) {
        return new GameManager(systemManager);
    }
    startGame() {
        this.intervalManager.tick.subscribe(this.onTickUpdate);
        this.intervalManager.second.subscribe(this.onSecondUpdate);
        this.intervalManager.startAll();
    }
}
