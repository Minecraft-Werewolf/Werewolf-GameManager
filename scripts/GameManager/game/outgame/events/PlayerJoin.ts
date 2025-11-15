import { PlayerJoinAfterEvent, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import type { OutGameEventManager } from "./OutGameEventManager";

export class OutGamePlayerJoinHandler extends BaseEventHandler<undefined, PlayerJoinAfterEvent> {
    private constructor(private readonly outGameEventManager: OutGameEventManager) {
        super(outGameEventManager);
    }
    public static create(outGameEventManager: OutGameEventManager): OutGamePlayerJoinHandler {
        return new OutGamePlayerJoinHandler(outGameEventManager);
    }

    protected afterEvent = world.afterEvents.playerJoin;

    protected handleAfter(ev: PlayerJoinAfterEvent): void {
        const { playerId, playerName } = ev;

        const player = world.getPlayers().find((p) => p.id === playerId);
        if (!player) return;

        this.outGameEventManager.getOutGameManager().initializePlayer(player);
    }
}
