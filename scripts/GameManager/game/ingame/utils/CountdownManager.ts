import { system } from "@minecraft/server";

export interface CountdownOptions {
    onNormalTick?: (seconds: number) => void;
    onWarningTick?: (seconds: number) => void;
    onComplete?: () => void;
}

export class CountdownManager {
    private remainingTime = 0;
    private resolveFn: (() => void) | null = null;
    private isRunning = false;
    private intervalId: number | null = null;

    private readonly verbose: boolean;

    private constructor(private readonly totalTime: number, verbose = true) {
        this.remainingTime = totalTime;
        this.verbose = verbose;
    }

    public static create(totalTime: number, verbose = true): CountdownManager {
        return new CountdownManager(totalTime, verbose);
    }

    public async startAsync(options?: CountdownOptions): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;

        return new Promise<void>((resolve) => {
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

    private handleTick(options?: CountdownOptions): void {
        const s = this.remainingTime;

        if (
            !this.verbose &&
            s % 10 !== 0 &&
            ![3, 2, 1, 0].includes(s)
        ) {
            return;
        }

        if (s > 3) {
            options?.onNormalTick?.(s);
        } else if (s <= 3 && s >= 1) {
            options?.onWarningTick?.(s);
        }
    }

    private complete(options?: CountdownOptions): void {
        if (this.intervalId !== null) {
            system.clearRun(this.intervalId);
            this.intervalId = null;
        }

        options?.onWarningTick?.(0);
        options?.onComplete?.();

        if (this.resolveFn) {
            this.resolveFn();
            this.resolveFn = null;
        }

        this.isRunning = false;
    }

    public stop(): void {
        if (this.intervalId !== null) {
            system.clearRun(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        this.resolveFn = null;
    }

    public getRemainingTime(): number {
        return this.remainingTime;
    }
}