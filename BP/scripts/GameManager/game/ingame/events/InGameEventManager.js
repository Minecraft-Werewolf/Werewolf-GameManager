import { BaseEventManager } from "../../events/BaseEventManager";
import { InGameEntityHurtHandler } from "./EntityHurt";
export class InGameEventManager extends BaseEventManager {
    constructor(inGameManager) {
        super();
        this.inGameManager = inGameManager;
        this.entityHurt = InGameEntityHurtHandler.create(this);
    }
    static create(inGameManager) {
        return new InGameEventManager(inGameManager);
    }
    subscribeAll() {
        this.entityHurt.subscribe();
    }
    unsubscribeAll() {
        this.entityHurt.unsubscribe();
    }
    getInGameManager() {
        return this.inGameManager;
    }
}
