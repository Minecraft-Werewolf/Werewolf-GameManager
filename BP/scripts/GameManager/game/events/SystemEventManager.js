import { SystemManager } from "../SystemManager";
import { BaseEventManager } from "./BaseEventManager";
import { ItemUseHandler } from "./ItemUseHandler";
import { ScriptEventReceiveHandler } from "./ScriptEventReceiveHandler";
export class SystemEventManager extends BaseEventManager {
    constructor(systemManager) {
        super();
        this.systemManager = systemManager;
        this.itemUse = ItemUseHandler.create(this);
        this.scriptEventReceive = ScriptEventReceiveHandler.create(this);
    }
    static create(systemManager) {
        return new SystemEventManager(systemManager);
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
