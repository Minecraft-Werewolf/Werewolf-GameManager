import type { WerewolfGameManager } from "../WerewolfGameManager";
import { ItemUseHandler } from "./ItemUseHandler";
import { ScriptEventReceiveHandler } from "./ScriptEventReceiveHandler";

export class EventManager {
    private readonly itemUse: ItemUseHandler;
    private readonly scriptEventReceive: ScriptEventReceiveHandler;

    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {
        this.itemUse = ItemUseHandler.create(this);
        this.scriptEventReceive = ScriptEventReceiveHandler.create(this);
    }
    public static create(werewolfGameManager: WerewolfGameManager): EventManager {
        return new EventManager(werewolfGameManager);
    }

    public subscribeAll(): void {
        this.itemUse.subscribe();
        this.scriptEventReceive.subscribe();
    }

    public unsubscribeAll(): void {
        this.itemUse.unsubscribe();
        this.scriptEventReceive.unsubscribe();
    }

    public getWerewolfGameManager(): WerewolfGameManager {
        return this.werewolfGameManager;
    }
}