import type { SystemManager } from "../SystemManager";
import { ItemUseHandler } from "./ItemUseHandler";
import { ScriptEventReceiveHandler } from "./ScriptEventReceiveHandler";

export class EventManager {
    private readonly itemUse: ItemUseHandler;
    private readonly scriptEventReceive: ScriptEventReceiveHandler;

    private constructor(private readonly systemManager: SystemManager) {
        this.itemUse = ItemUseHandler.create(this);
        this.scriptEventReceive = ScriptEventReceiveHandler.create(this);
    }
    public static create(systemManager: SystemManager): EventManager {
        return new EventManager(systemManager);
    }

    public subscribeAll(): void {
        this.itemUse.subscribe();
        this.scriptEventReceive.subscribe();
    }

    public unsubscribeAll(): void {
        this.itemUse.unsubscribe();
        this.scriptEventReceive.unsubscribe();
    }

    public getSystemManager(): SystemManager {
        return this.systemManager;
    }
}