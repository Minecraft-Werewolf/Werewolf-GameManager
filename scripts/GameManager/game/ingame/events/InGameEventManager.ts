import { BaseEventManager } from "../../events/BaseEventManager";
import type { InGameManager } from "../InGameManager";
import { InGameEntityHurtHandler } from "./EntityHurt";

export class InGameEventManager extends BaseEventManager {
    private entityHurt: InGameEntityHurtHandler;
    private constructor(private readonly inGameManager: InGameManager) {
        super();
        this.entityHurt = InGameEntityHurtHandler.create(this);
    }

    public static create(inGameManager: InGameManager): InGameEventManager {
        return new InGameEventManager(inGameManager);
    }

    public override subscribeAll(): void {
        this.entityHurt.subscribe();
    }

    public override unsubscribeAll(): void {
        this.entityHurt.unsubscribe();
    }

    public getInGameManager(): InGameManager {
        return this.inGameManager;
    }
}
