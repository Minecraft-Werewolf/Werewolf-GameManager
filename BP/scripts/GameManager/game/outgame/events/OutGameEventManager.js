import { system, world } from "@minecraft/server";
import { BaseEventManager } from "../../events/BaseEventManager";
import { OutGameItemUseHandler } from "./ItemUse";
import { OutGameScriptEventReceiveHandler } from "./ScriptEventReceive";
import { OutGamePlayerJoinHandler } from "./PlayerJoin";
export class OutGameEventManager extends BaseEventManager {
    constructor(outGameManager) {
        super();
        this.outGameManager = outGameManager;
        this.itemUse = OutGameItemUseHandler.create(this);
        this.playerJoin = OutGamePlayerJoinHandler.create(this);
        this.scriptEventReceive = OutGameScriptEventReceiveHandler.create(this);
    }
    static create(outGameManager) {
        return new OutGameEventManager(outGameManager);
    }
    subscribeAll() {
        this.itemUse.subscribe();
        this.playerJoin.subscribe();
        this.scriptEventReceive.subscribe();
    }
    unsubscribeAll() {
        this.itemUse.unsubscribe();
        this.playerJoin.unsubscribe();
        this.scriptEventReceive.unsubscribe();
    }
    getOutGameManager() {
        return this.outGameManager;
    }
}
