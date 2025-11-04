export class BaseEventHandler {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.isSubscribed = false;
    }
    subscribe() {
        if (this.isSubscribed)
            return;
        if (this.beforeEvent && this.handleBefore) {
            this.beforeEvent.subscribe(this.handleBefore.bind(this));
        }
        if (this.afterEvent && this.handleAfter) {
            this.afterEvent.subscribe(this.handleAfter.bind(this));
        }
        this.isSubscribed = true;
    }
    unsubscribe() {
        if (!this.isSubscribed)
            return;
        if (this.beforeEvent && this.handleBefore) {
            this.beforeEvent.unsubscribe(this.handleBefore.bind(this));
        }
        if (this.afterEvent && this.handleAfter) {
            this.afterEvent.unsubscribe(this.handleAfter.bind(this));
        }
        this.isSubscribed = false;
    }
}
