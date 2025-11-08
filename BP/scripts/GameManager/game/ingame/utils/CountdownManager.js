import { system } from "@minecraft/server";
export class CountdownManager {
    constructor(totalTime, verbose = true) {
        this.totalTime = totalTime;
        this.remainingTime = 0;
        this.resolveFn = null;
        this.isRunning = false;
        this.intervalId = null;
        this.remainingTime = totalTime;
        this.verbose = verbose;
    }
    static create(totalTime, verbose = true) {
        return new CountdownManager(totalTime, verbose);
    }
    async startAsync(options) {
        if (this.isRunning)
            return;
        this.isRunning = true;
        return new Promise((resolve) => {
            this.resolveFn = resolve;
            this.intervalId = system.runInterval(() => {
                if (this.remainingTime <= 0) {
                    this.complete(options);
                    return;
                }
                this.handleTick(options);
                this.remainingTime--;
            }, 20);
        });
    }
    handleTick(options) {
        const s = this.remainingTime;
        if (!this.verbose &&
            s % 10 !== 0 &&
            ![3, 2, 1, 0].includes(s)) {
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
        if (this.intervalId !== null) {
            system.clearRun(this.intervalId);
            this.intervalId = null;
        }
        options?.onComplete?.();
        if (this.resolveFn) {
            this.resolveFn();
            this.resolveFn = null;
        }
        this.isRunning = false;
    }
    stop() {
        if (this.intervalId !== null) {
            system.clearRun(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        this.resolveFn = null;
    }
    getRemainingTime() {
        return this.remainingTime;
    }
}
