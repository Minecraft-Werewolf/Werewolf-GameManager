import { BaseEventManager } from "../../events/BaseEventManager";
export class SystemEventManager extends BaseEventManager {
    constructor(systemManager) {
        super();
        this.systemManager = systemManager;
    }
    static create(systemManager) {
        return new SystemEventManager(systemManager);
    }
    subscribeAll() { }
    unsubscribeAll() { }
    getSystemManager() {
        return this.systemManager;
    }
}
