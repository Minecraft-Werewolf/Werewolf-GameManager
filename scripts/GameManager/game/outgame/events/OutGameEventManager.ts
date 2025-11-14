import { BaseEventManager } from "../../events/BaseEventManager";
import type { OutGameManager } from "../OutGameManager";
import { OutGameItemUseHandler } from "./ItemUse";
import { OutGameScriptEventReceiveHandler } from "./ScriptEventReceive";

export class OutGameEventManager extends BaseEventManager {
    private readonly itemUse: OutGameItemUseHandler;
    private readonly scriptEventReceive: OutGameScriptEventReceiveHandler;

    private constructor(private readonly outGameManager: OutGameManager) {
        super();
        this.itemUse = OutGameItemUseHandler.create(this);
        this.scriptEventReceive = OutGameScriptEventReceiveHandler.create(this);
    }
    public static create(outGameManager: OutGameManager): OutGameEventManager {
        return new OutGameEventManager(outGameManager);
    }

    public override subscribeAll(): void {
        this.itemUse.subscribe();
        this.scriptEventReceive.subscribe();
    }

    public override unsubscribeAll(): void {
        this.itemUse.subscribe();
        this.scriptEventReceive.unsubscribe();
    }

    public getOutGameManager(): OutGameManager {
        return this.outGameManager;
    }
}
