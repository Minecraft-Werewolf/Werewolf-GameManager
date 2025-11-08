import { system } from "@minecraft/server";
export class BaseInterval {
    constructor(delay) {
        this.delay = delay;
        this.intervalId = null;
        this.subscribers = new Set();
    }
    /** interval開始 */
    start() {
        this.stop();
        this.intervalId = system.runInterval(() => {
            for (const fn of this.subscribers)
                fn();
        }, this.delay);
    }
    /** interval停止 */
    stop() {
        if (this.intervalId !== null) {
            system.clearRun(this.intervalId);
            this.intervalId = null;
        }
    }
    restart() {
        this.stop();
        this.start();
    }
    /** 登録 */
    subscribe(fn, runImmediately = false) {
        this.subscribers.add(fn);
        if (runImmediately)
            fn();
    }
    /** 登録解除 */
    unsubscribe(fn) {
        this.subscribers.delete(fn);
    }
    /** 全解除 */
    clear() {
        this.stop();
        this.subscribers.clear();
    }
    /** 現在の登録数（デバッグ用） */
    get size() {
        return this.subscribers.size;
    }
    get isRunning() {
        return this.intervalId !== null;
    }
}
