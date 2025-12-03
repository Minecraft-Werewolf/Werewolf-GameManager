import { BaseEventManager } from "../../events/BaseEventManager";
import { OutGameItemUseHandler } from "./ItemUse";
import { OutGamePlayerSpawnHandler } from "./PlayerSpawn";
export class OutGameEventManager extends BaseEventManager {
    constructor(outGameManager) {
        super();
        this.outGameManager = outGameManager;
        this.itemUse = OutGameItemUseHandler.create(this);
        this.playerSpawn = OutGamePlayerSpawnHandler.create(this);
    }
    static create(outGameManager) {
        return new OutGameEventManager(outGameManager);
    }
    subscribeAll() {
        this.itemUse.subscribe();
        this.playerSpawn.subscribe();
    }
    unsubscribeAll() {
        this.itemUse.unsubscribe();
        this.playerSpawn.unsubscribe();
    }
    getOutGameManager() {
        return this.outGameManager;
    }
}
