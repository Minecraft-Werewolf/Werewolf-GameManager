import { BaseEventManager } from "../../events/BaseEventManager";
export class InGameEventManager extends BaseEventManager {
    constructor(inGameManager) {
        super();
        this.inGameManager = inGameManager;
    }
    static create(inGameManager) {
        return new InGameEventManager(inGameManager);
    }
    subscribeAll() {
    }
    unsubscribeAll() {
    }
    getInGameManager() {
        return this.inGameManager;
    }
}
