import { ItemUseHandler } from "./ItemUseHandler";
export class EventManager {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
        this.itemUse = ItemUseHandler.create(this);
    }
    static create(werewolfGameManager) {
        return new EventManager(werewolfGameManager);
    }
    subscribeAll() {
        this.itemUse.subscribe();
    }
    unsubscribeAll() {
        this.itemUse.unsubscribe();
    }
    getWerewolfGameManager() {
        return this.werewolfGameManager;
    }
}
