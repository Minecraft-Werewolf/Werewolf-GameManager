import { EntityHealthComponent, GameMode, Player, world, type EntityHurtAfterEvent } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import type { InGameEventManager } from "./InGameEventManager";
import { GamePhase } from "../InGameManager";
import { MINECRAFT } from "../../../constants/minecraft";

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

        if (hurtEntity.typeId !== MINECRAFT.TYPE_ID_PLAYER) return;
        const hurtPlayer = hurtEntity as Player;
        const hurtPlayerHealth = hurtPlayer.getComponent(MINECRAFT.COMPONENT_ID_HEALTH) as EntityHealthComponent;
        const hurtPlayerData = gameManager.getPlayerData(hurtPlayer.id);
        if (!hurtPlayerData || !hurtPlayerHealth) return;

        if (hurtPlayerHealth.currentValue === 0) {
            hurtPlayerData.isAlive = false;
            hurtPlayer.setGameMode(GameMode.Spectator);
        }
    }
}