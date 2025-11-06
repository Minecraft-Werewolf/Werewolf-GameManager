import type { EventManager } from "./EventManager";

export abstract class BaseEventHandler<TBefore = undefined, TAfter = undefined> {
    protected isSubscribed = false;

    protected constructor(protected readonly eventManager: EventManager) {}

    protected beforeEvent?:
        | {
              subscribe: (callback: (ev: TBefore) => void) => void;
              unsubscribe: (callback: (ev: TBefore) => void) => void;
          }
        | undefined;

    protected afterEvent?:
        | {
              subscribe: (callback: (ev: TAfter) => void) => void;
              unsubscribe: (callback: (ev: TAfter) => void) => void;
          }
        | undefined;

    /** サブクラスで任意に実装 */
    protected handleBefore?(ev: TBefore): void;
    protected handleAfter?(ev: TAfter): void;

    public subscribe(): void {
        if (this.isSubscribed) return;

        if (this.beforeEvent && this.handleBefore) {
            this.beforeEvent.subscribe(this.handleBefore.bind(this));
        }

        if (this.afterEvent && this.handleAfter) {
            this.afterEvent.subscribe(this.handleAfter.bind(this));
        }

        this.isSubscribed = true;
    }

    public unsubscribe(): void {
        if (!this.isSubscribed) return;

        if (this.beforeEvent && this.handleBefore) {
            this.beforeEvent.unsubscribe(this.handleBefore.bind(this));
        }

        if (this.afterEvent && this.handleAfter) {
            this.afterEvent.unsubscribe(this.handleAfter.bind(this));
        }

        this.isSubscribed = false;
    }
}
