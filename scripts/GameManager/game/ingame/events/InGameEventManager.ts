import { BaseEventManager } from "../../events/BaseEventManager";
import type { InGameManager } from "../InGameManager";
import { InGameEntityHurtHandler } from "./EntityHurt";
import { InGameItemUseHandler } from "./ItemUse";

export class InGameEventManager extends BaseEventManager {
    private entityHurt: InGameEntityHurtHandler;
    private itemUse: InGameItemUseHandler;
    private constructor(private readonly inGameManager: InGameManager) {
        super();
        this.entityHurt = InGameEntityHurtHandler.create(this);
        this.itemUse = InGameItemUseHandler.create(this);
    }

    public static create(inGameManager: InGameManager): InGameEventManager {
        return new InGameEventManager(inGameManager);
    }

    public override subscribeAll(): void {
        this.entityHurt.subscribe();
        this.itemUse.subscribe();
    }

    public override unsubscribeAll(): void {
        this.entityHurt.unsubscribe();
        this.itemUse.unsubscribe();
    }

    public getInGameManager(): InGameManager {
        return this.inGameManager;
    }
}
