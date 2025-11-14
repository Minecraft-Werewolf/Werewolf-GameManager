import {
    EntityComponentTypes,
    GameMode,
    Player,
    world,
    type EntityHurtAfterEvent,
} from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import type { InGameEventManager } from "./InGameEventManager";
import { GamePhase } from "../InGameManager";

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
        const currentGamePhase = this.inGameEventManager.getInGameManager().getCurrentPhase();
        if (currentGamePhase !== GamePhase.InGame) return;

        const gameManager = this.inGameEventManager.getInGameManager().getGameManager();

        if (!(hurtEntity instanceof Player)) return;
        const hurtPlayer = hurtEntity as Player;
        const hurtPlayerHealthComponent = hurtPlayer.getComponent(EntityComponentTypes.Health);
        const hurtPlayerData = gameManager.getPlayerData(hurtPlayer.id);
        if (!hurtPlayerData || !hurtPlayerHealthComponent) return;

        if (hurtPlayerHealthComponent.currentValue === 0) {
            hurtPlayerData.isAlive = false;
            hurtPlayer.setGameMode(GameMode.Spectator);
        }
    }
}
