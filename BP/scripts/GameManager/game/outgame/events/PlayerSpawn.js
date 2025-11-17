import { PlayerJoinAfterEvent, PlayerSpawnAfterEvent, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
export class OutGamePlayerSpawnHandler extends BaseEventHandler {
    constructor(outGameEventManager) {
        super(outGameEventManager);
        this.outGameEventManager = outGameEventManager;
        this.afterEvent = world.afterEvents.playerSpawn;
    }
    static create(outGameEventManager) {
        return new OutGamePlayerSpawnHandler(outGameEventManager);
    }
    handleAfter(ev) {
        const { initialSpawn, player } = ev;
        this.outGameEventManager.getOutGameManager().initializePlayer(player);
    }
}
