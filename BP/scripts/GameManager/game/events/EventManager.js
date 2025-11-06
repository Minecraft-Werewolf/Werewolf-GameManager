import { ItemUseHandler } from "./ItemUseHandler";
import { ScriptEventReceiveHandler } from "./ScriptEventReceiveHandler";
export class EventManager {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
        this.itemUse = ItemUseHandler.create(this);
        this.scriptEventReceive = ScriptEventReceiveHandler.create(this);
    }
    static create(werewolfGameManager) {
        return new EventManager(werewolfGameManager);
    }
    subscribeAll() {
        this.itemUse.subscribe();
        this.scriptEventReceive.subscribe();
    }
    unsubscribeAll() {
        this.itemUse.unsubscribe();
        this.scriptEventReceive.unsubscribe();
    }
    getWerewolfGameManager() {
        return this.werewolfGameManager;
    }
}
