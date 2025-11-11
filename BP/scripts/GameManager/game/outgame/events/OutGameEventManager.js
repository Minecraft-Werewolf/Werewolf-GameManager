import { BaseEventManager } from "../../events/BaseEventManager";
import { OutGameItemUseHandler } from "./ItemUse";
import { OutGameScriptEventReceiveHandler } from "./ScriptEventReceive";
export class OutGameEventManager extends BaseEventManager {
    constructor(outGameManager) {
        super();
        this.outGameManager = outGameManager;
        this.itemUse = OutGameItemUseHandler.create(this);
        this.scriptEventReceive = OutGameScriptEventReceiveHandler.create(this);
    }
    static create(outGameManager) {
        return new OutGameEventManager(outGameManager);
    }
    subscribeAll() {
        this.itemUse.subscribe();
        this.scriptEventReceive.subscribe();
    }
    unsubscribeAll() {
        this.itemUse.subscribe();
        this.scriptEventReceive.unsubscribe();
    }
    getOutGameManager() {
        return this.outGameManager;
    }
}
