import { ItemUseHandler } from "./ItemUseHandler";
import { ScriptEventReceiveHandler } from "./ScriptEventReceiveHandler";
export class EventManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.itemUse = ItemUseHandler.create(this);
        this.scriptEventReceive = ScriptEventReceiveHandler.create(this);
    }
    static create(systemManager) {
        return new EventManager(systemManager);
    }
    subscribeAll() {
        this.itemUse.subscribe();
        this.scriptEventReceive.subscribe();
    }
    unsubscribeAll() {
        this.itemUse.unsubscribe();
        this.scriptEventReceive.unsubscribe();
    }
    getSystemManager() {
        return this.systemManager;
    }
}
