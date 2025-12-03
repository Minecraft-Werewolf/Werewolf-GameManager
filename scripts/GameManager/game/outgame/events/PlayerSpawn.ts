import { PlayerJoinAfterEvent, PlayerSpawnAfterEvent, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import type { OutGameEventManager } from "./OutGameEventManager";

export class OutGamePlayerSpawnHandler extends BaseEventHandler<undefined, PlayerSpawnAfterEvent> {
    private constructor(private readonly outGameEventManager: OutGameEventManager) {
        super(outGameEventManager);
    }
    public static create(outGameEventManager: OutGameEventManager): OutGamePlayerSpawnHandler {
        return new OutGamePlayerSpawnHandler(outGameEventManager);
    }

    protected afterEvent = world.afterEvents.playerSpawn;

    protected handleAfter(ev: PlayerSpawnAfterEvent): void {
        const { initialSpawn, player } = ev;

        this.outGameEventManager.getOutGameManager().initializePlayer(player);
    }
}
