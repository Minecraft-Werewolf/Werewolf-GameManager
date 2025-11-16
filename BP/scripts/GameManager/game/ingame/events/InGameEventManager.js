import { BaseEventManager } from "../../events/BaseEventManager";
import { InGameEntityHurtHandler } from "./EntityHurt";
import { InGameItemUseHandler } from "./ItemUse";
export class InGameEventManager extends BaseEventManager {
    constructor(inGameManager) {
        super();
        this.inGameManager = inGameManager;
        this.entityHurt = InGameEntityHurtHandler.create(this);
        this.itemUse = InGameItemUseHandler.create(this);
    }
    static create(inGameManager) {
        return new InGameEventManager(inGameManager);
    }
    subscribeAll() {
        this.entityHurt.subscribe();
        this.itemUse.subscribe();
    }
    unsubscribeAll() {
        this.entityHurt.unsubscribe();
        this.itemUse.unsubscribe();
    }
    getInGameManager() {
        return this.inGameManager;
    }
}
