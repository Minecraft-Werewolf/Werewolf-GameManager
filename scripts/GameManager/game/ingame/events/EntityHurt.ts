import { EntityHealthComponent, world, type EntityHurtAfterEvent } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import type { InGameEventManager } from "./InGameEventManager";
import { GamePhase } from "../InGameManager";
import { SYSTEMS } from "../../../constants/systems";

export class InGameEntityHurtHandler extends BaseEventHandler<undefined, EntityHurtAfterEvent> {
    private constructor(private readonly inGameEventManager: InGameEventManager) {
        super(inGameEventManager);
    }
    public static create(inGameEventManager: InGameEventManager): InGameEntityHurtHandler {
        return new InGameEntityHurtHandler(inGameEventManager);
    }

    protected afterEvent = world.afterEvents.entityHurt;

    protected handleAfter(ev: EntityHurtAfterEvent): void {
        const { damage, damageSource, hurtEntity } = ev;
        if (hurtEntity.typeId !== SYSTEMS.TYPE_ID_PLAYER) return;

        const currentGamePhase = this.inGameEventManager.getInGameManager().getCurrentPhase();
        if (currentGamePhase !== GamePhase.InGame) return;

        const gameManager = this.inGameEventManager.getInGameManager().getGameManager();

        const hurtEntityHealth = hurtEntity.getComponent(SYSTEMS.COMPONENT_ID_HEALTH) as EntityHealthComponent;
        const hurtEntityData = gameManager.getPlayerData(hurtEntity.id);
        if (!hurtEntityData || !hurtEntityHealth) return;

        if (hurtEntityHealth.currentValue === 0) {
            hurtEntityData.isAlive = false;
        }
    }
}