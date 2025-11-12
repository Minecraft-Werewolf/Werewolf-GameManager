import { BaseEventManager } from "../../events/BaseEventManager";
import { InGameEntityHurtHandler } from "./EntityHurt";
import { InGameScriptEventReceiveHandler } from "./ScriptEventReceive";
export class InGameEventManager extends BaseEventManager {
    constructor(inGameManager) {
        super();
        this.inGameManager = inGameManager;
        this.entityHurt = InGameEntityHurtHandler.create(this);
        this.scriptEventReceive = InGameScriptEventReceiveHandler.create(this);
    }
    static create(inGameManager) {
        return new InGameEventManager(inGameManager);
    }
    subscribeAll() {
        this.entityHurt.subscribe();
        this.scriptEventReceive.subscribe();
    }
    unsubscribeAll() {
        this.entityHurt.unsubscribe();
        this.scriptEventReceive.unsubscribe();
    }
    getInGameManager() {
        return this.inGameManager;
    }
}
