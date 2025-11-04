import { system } from "@minecraft/server";
import type { WerewolfGameManager } from "../WerewolfGameManager";
import { SYSTEMS } from "../../constants";

interface IntervalIds {
    everyTick: number | null;
    everySecond: number | null;
}

export class IntervalManager {
    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {}
    public static create(werewolfGameManager: WerewolfGameManager): IntervalManager {
        return new IntervalManager(werewolfGameManager);
    }

    private intervalIds: IntervalIds = {
        everyTick: null,
        everySecond: null,
    }

    public runIntervals(): void {
        this.clearIntervals();

        this.intervalIds.everyTick = system.runInterval(() => {
            this.werewolfGameManager.onEveryTickInGame();
        }, SYSTEMS.INTERVAL_EVERY_TICK);

        this.intervalIds.everySecond = system.runInterval(() => {
            this.werewolfGameManager.onEverySecondInGame();
        }, SYSTEMS.INTERVAL_EVERY_SECOND);
    }

    public clearIntervals(): void {
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