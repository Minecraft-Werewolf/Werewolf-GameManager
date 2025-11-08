import { SecondInterval } from "./SecondInterval";
import { TickInterval } from "./TickInterval";
export class IntervalManager {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
        this.tickInterval = new TickInterval(this);
        this.secondInterval = new SecondInterval(this);
    }
    static create(werewolfGameManager) {
        return new IntervalManager(werewolfGameManager);
    }
    /** 全interval開始 */
    startAll() {
        this.tickInterval.start();
        this.secondInterval.start();
    }
    /** 全interval停止＆解除 */
    clearAll() {
        this.tickInterval.clear();
        this.secondInterval.clear();
    }
    get tick() {
        return this.tickInterval;
    }
    get second() {
        return this.secondInterval;
    }
}
