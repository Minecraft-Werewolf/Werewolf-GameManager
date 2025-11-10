import { BaseEventManager } from "../../events/BaseEventManager";
import type { InGameManager } from "../InGameManager";
import { InGameScriptEventReceiveHandler } from "./ScriptEventReceive";

export class InGameEventManager extends BaseEventManager {
    private scriptEventReceive: InGameScriptEventReceiveHandler;
    private constructor(private readonly inGameManager: InGameManager) {
        super();
        this.scriptEventReceive = InGameScriptEventReceiveHandler.create(this);
    }

    public static create(inGameManager: InGameManager): InGameEventManager {
        return new InGameEventManager(inGameManager);
    }

    public override subscribeAll(): void {
        this.scriptEventReceive.subscribe();
    }

    public override unsubscribeAll(): void {
        this.scriptEventReceive.unsubscribe();
    }

    public getInGameManager(): InGameManager {
        return this.inGameManager;
    }
}