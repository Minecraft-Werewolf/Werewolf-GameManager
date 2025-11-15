import { PlayerJoinAfterEvent, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
export class OutGamePlayerJoinHandler extends BaseEventHandler {
    constructor(outGameEventManager) {
        super(outGameEventManager);
        this.outGameEventManager = outGameEventManager;
        this.afterEvent = world.afterEvents.playerJoin;
    }
    static create(outGameEventManager) {
        return new OutGamePlayerJoinHandler(outGameEventManager);
    }
    handleAfter(ev) {
        const { playerId, playerName } = ev;
        const player = world.getPlayers().find((p) => p.id === playerId);
        if (!player)
            return;
        this.outGameEventManager.getOutGameManager().initializePlayer(player);
    }
}
