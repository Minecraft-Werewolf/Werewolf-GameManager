import { BaseEventManager } from "../../events/BaseEventManager";
import type { InGameManager } from "../InGameManager";
import { InGameEntityHurtHandler } from "./EntityHurt";
import { InGameScriptEventReceiveHandler } from "./ScriptEventReceive";

export class InGameEventManager extends BaseEventManager {
    private entityHurt: InGameEntityHurtHandler;
    private scriptEventReceive: InGameScriptEventReceiveHandler;
    private constructor(private readonly inGameManager: InGameManager) {
        super();
        this.entityHurt = InGameEntityHurtHandler.create(this);
        this.scriptEventReceive = InGameScriptEventReceiveHandler.create(this);
    }

    public static create(inGameManager: InGameManager): InGameEventManager {
        return new InGameEventManager(inGameManager);
    }

    public override subscribeAll(): void {
        this.entityHurt.subscribe();
        this.scriptEventReceive.subscribe();
    }

    public override unsubscribeAll(): void {
        this.entityHurt.unsubscribe();
        this.scriptEventReceive.unsubscribe();
    }

    public getInGameManager(): InGameManager {
        return this.inGameManager;
    }
}