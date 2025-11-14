import { EntityComponentTypes, GameMode, Player, world, } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { GamePhase } from "../InGameManager";
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
        if (!(hurtEntity instanceof Player))
            return;
        const hurtPlayer = hurtEntity;
        const hurtPlayerHealthComponent = hurtPlayer.getComponent(EntityComponentTypes.Health);
        const hurtPlayerData = gameManager.getPlayerData(hurtPlayer.id);
        if (!hurtPlayerData || !hurtPlayerHealthComponent)
            return;
        if (hurtPlayerHealthComponent.currentValue === 0) {
            hurtPlayerData.isAlive = false;
            hurtPlayer.setGameMode(GameMode.Spectator);
        }
    }
}
