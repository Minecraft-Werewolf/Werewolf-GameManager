import { BaseEventManager } from "../../events/BaseEventManager";
import { InGameScriptEventReceiveHandler } from "./ScriptEventReceive";
export class InGameEventManager extends BaseEventManager {
    constructor(inGameManager) {
        super();
        this.inGameManager = inGameManager;
        this.scriptEventReceive = InGameScriptEventReceiveHandler.create(this);
    }
    static create(inGameManager) {
        return new InGameEventManager(inGameManager);
    }
    subscribeAll() {
        this.scriptEventReceive.subscribe();
    }
    unsubscribeAll() {
        this.scriptEventReceive.unsubscribe();
    }
    getInGameManager() {
        return this.inGameManager;
    }
}
