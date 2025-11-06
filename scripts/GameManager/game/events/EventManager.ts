import type { WerewolfGameManager } from "../WerewolfGameManager";
import { ItemUseHandler } from "./ItemUseHandler";

export class EventManager {
    private readonly itemUse: ItemUseHandler;

    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {
        this.itemUse = ItemUseHandler.create(this);
    }
    public static create(werewolfGameManager: WerewolfGameManager): EventManager {
        return new EventManager(werewolfGameManager);
    }

    public subscribeAll(): void {
        this.itemUse.subscribe();
    }

    public unsubscribeAll(): void {
        this.itemUse.unsubscribe();
    }

    public getWerewolfGameManager(): WerewolfGameManager {
        return this.werewolfGameManager;
    }
}