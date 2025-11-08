import { SecondInterval } from "./interval/SecondInterval";
import { TickInterval } from "./interval/TickInterval";
export class IntervalManager {
    constructor() {
        this.tickInterval = new TickInterval(this);
        this.secondInterval = new SecondInterval(this);
    }
    static create() {
        return new IntervalManager();
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
