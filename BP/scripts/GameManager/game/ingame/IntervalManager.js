import { system } from "@minecraft/server";
import { SYSTEMS } from "../../constants";
export class IntervalManager {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
        this.intervalIds = {
            everyTick: null,
            everySecond: null,
        };
    }
    static create(werewolfGameManager) {
        return new IntervalManager(werewolfGameManager);
    }
    runIntervals() {
        this.clearIntervals();
        this.intervalIds.everyTick = system.runInterval(() => {
            this.werewolfGameManager.onEveryTickInGame();
        }, SYSTEMS.INTERVAL_EVERY_TICK);
        this.intervalIds.everySecond = system.runInterval(() => {
            this.werewolfGameManager.onEverySecondInGame();
        }, SYSTEMS.INTERVAL_EVERY_SECOND);
    }
    clearIntervals() {
        if (this.intervalIds.everyTick !== null) {
            system.clearRun(this.intervalIds.everyTick);
            this.intervalIds.everyTick = null;
        }
        if (this.intervalIds.everySecond !== null) {
            system.clearRun(this.intervalIds.everySecond);
            this.intervalIds.everySecond = null;
        }
    }
}
