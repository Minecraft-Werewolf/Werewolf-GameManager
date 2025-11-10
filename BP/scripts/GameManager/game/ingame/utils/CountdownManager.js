import { IntervalManager } from "./IntervalManager";
export class CountdownManager {
    constructor(totalTime, verbose = true) {
        this.totalTime = totalTime;
        this.verbose = verbose;
        this.remainingTime = 0;
        this.isRunning = false;
        this.isCancelled = false;
        this.resolveFn = null;
        this.rejectFn = null;
        this.remainingTime = totalTime;
        this.intervalManager = IntervalManager.create();
    }
    static create(totalTime, verbose = true) {
        return new CountdownManager(totalTime, verbose);
    }
    async startAsync(options) {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.isCancelled = false;
        return new Promise((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;
            this.intervalManager.tick.subscribe(() => {
                if (!this.isRunning)
                    return;
                if (this.isCancelled) {
                    this.stopInternal(reject, new Error("Countdown cancelled"));
                }
            }, true);
            this.intervalManager.second.subscribe(() => {
                if (!this.isRunning || this.isCancelled)
                    return;
                if (this.remainingTime <= 0) {
                    this.complete(options);
                    return;
                }
                this.handleSecond(options);
                this.remainingTime--;
            }, true);
            this.intervalManager.startAll();
        });
    }
    handleSecond(options) {
        const s = this.remainingTime;
        if (!this.verbose && s % 10 !== 0 && ![3, 2, 1, 0].includes(s)) {
            return;
        }
        if (s > 3) {
            options?.onNormalTick?.(s);
        }
        else if (s <= 3 && s >= 1) {
            options?.onWarningTick?.(s);
        }
    }
    complete(options) {
        const resolve = this.resolveFn;
        this.cleanup();
        options?.onComplete?.();
        resolve?.();
    }
    stop() {
        if (!this.isRunning)
            return;
        this.isCancelled = true;
    }
    stopInternal(reject, reason) {
        this.cleanup();
        reject(reason);
    }
    cleanup() {
        this.intervalManager.clearAll();
        this.isRunning = false;
    }
    getRemainingTime() {
        return this.remainingTime;
    }
}
