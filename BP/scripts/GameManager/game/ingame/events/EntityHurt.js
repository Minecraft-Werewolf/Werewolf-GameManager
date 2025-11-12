import { EntityHealthComponent, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { GamePhase } from "../InGameManager";
import { SYSTEMS } from "../../../constants/systems";
export class InGameEntityHurtHandler extends BaseEventHandler {
    constructor(inGameEventManager) {
        super(inGameEventManager);
        this.inGameEventManager = inGameEventManager;
        this.afterEvent = world.afterEvents.entityHurt;
    }
    static create(inGameEventManager) {
        return new InGameEntityHurtHandler(inGameEventManager);
    }
    handleAfter(ev) {
        const { damage, damageSource, hurtEntity } = ev;
        if (hurtEntity.typeId !== SYSTEMS.TYPE_ID_PLAYER)
            return;
        const currentGamePhase = this.inGameEventManager.getInGameManager().getCurrentPhase();
        if (currentGamePhase !== GamePhase.InGame)
            return;
        const gameManager = this.inGameEventManager.getInGameManager().getGameManager();
        const hurtEntityHealth = hurtEntity.getComponent(SYSTEMS.COMPONENT_ID_HEALTH);
        const hurtEntityData = gameManager.getPlayerData(hurtEntity.id);
        if (!hurtEntityData || !hurtEntityHealth)
            return;
        if (hurtEntityHealth.currentValue === 0) {
            hurtEntityData.isAlive = false;
        }
    }
}
