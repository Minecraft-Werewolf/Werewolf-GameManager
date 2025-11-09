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
            let tickCounter = 0;
            this.intervalManager.tick.subscribe(() => {
                if (this.isCancelled) {
                    this.stopInternal(reject, new Error("Countdown cancelled"));
                    return;
                }
                tickCounter++;
                if (tickCounter >= 20) {
                    tickCounter = 0;
                    this.handleSecondTick(options);
                }
            }, true);
            this.intervalManager.startAll();
        });
    }
    handleSecondTick(options) {
        if (this.remainingTime <= 0) {
            this.complete(options);
            return;
        }
        const s = this.remainingTime;
        if (this.verbose ||
            s % 10 === 0 ||
            [3, 2, 1].includes(s)) {
            if (s > 3) {
                options?.onNormalTick?.(s);
            }
            else {
                options?.onWarningTick?.(s);
            }
        }
        this.remainingTime--;
    }
    complete(options) {
        this.cleanup();
        options?.onComplete?.();
        this.resolveFn?.();
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
        this.resolveFn = null;
        this.rejectFn = null;
    }
    getRemainingTime() {
        return this.remainingTime;
    }
}
