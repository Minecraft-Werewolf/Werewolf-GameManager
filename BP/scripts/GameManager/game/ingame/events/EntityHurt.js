import { EntityHealthComponent, GameMode, Player, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { GamePhase } from "../InGameManager";
import { MINECRAFT } from "../../../constants/minecraft";
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
        const currentGamePhase = this.inGameEventManager.getInGameManager().getCurrentPhase();
        if (currentGamePhase !== GamePhase.InGame)
            return;
        const gameManager = this.inGameEventManager.getInGameManager().getGameManager();
        if (hurtEntity.typeId !== MINECRAFT.TYPE_ID_PLAYER)
            return;
        const hurtPlayer = hurtEntity;
        const hurtPlayerHealth = hurtPlayer.getComponent(MINECRAFT.COMPONENT_ID_HEALTH);
        const hurtPlayerData = gameManager.getPlayerData(hurtPlayer.id);
        if (!hurtPlayerData || !hurtPlayerHealth)
            return;
        if (hurtPlayerHealth.currentValue === 0) {
            hurtPlayerData.isAlive = false;
            hurtPlayer.setGameMode(GameMode.Spectator);
        }
    }
}
