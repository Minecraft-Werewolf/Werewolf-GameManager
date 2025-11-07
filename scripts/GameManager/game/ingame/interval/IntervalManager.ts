import type { WerewolfGameManager } from "../../WerewolfGameManager";
import { SecondInterval } from "./SecondInterval";
import { TickInterval } from "./TickInterval";

export class IntervalManager {
    private readonly tickInterval: TickInterval;
    private readonly secondInterval: SecondInterval;

    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {
        this.tickInterval = new TickInterval(this);
        this.secondInterval = new SecondInterval(this);
    }
    public static create(werewolfGameManager: WerewolfGameManager): IntervalManager {
        return new IntervalManager(werewolfGameManager);
    }

    /** 全interval開始 */
    public startAll(): void {
        this.tickInterval.start();
        this.secondInterval.start();
    }

    /** 全interval停止＆解除 */
    public clearAll(): void {
        this.tickInterval.clear();
        this.secondInterval.clear();
    }

    public get tick(): TickInterval {
        return this.tickInterval;
    }
    public get second(): SecondInterval {
        return this.secondInterval;
    }
}