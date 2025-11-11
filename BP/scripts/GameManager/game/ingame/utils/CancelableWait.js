import { system } from "@minecraft/server";
export class CancelableWait {
    constructor() {
        this.cancelled = false;
    }
    cancel() {
        this.cancelled = true;
    }
    reset() {
        this.cancelled = false;
    }
    async waitTicks(ticks) {
        for (let i = 0; i < ticks; i++) {
            if (this.cancelled)
                return;
            await system.waitTicks(1);
        }
    }
}
