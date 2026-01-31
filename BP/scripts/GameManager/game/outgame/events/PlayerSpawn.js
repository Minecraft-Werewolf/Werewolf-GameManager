import { PlayerJoinAfterEvent, PlayerSpawnAfterEvent, world } from "@minecraft/server";
import { BaseEventHandler } from "../../events/BaseEventHandler";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
export class OutGamePlayerSpawnHandler extends BaseEventHandler {
    constructor(outGameEventManager) {
        super(outGameEventManager);
        this.outGameEventManager = outGameEventManager;
        this.afterEvent = world.afterEvents.playerSpawn;
    }
    static create(outGameEventManager) {
        return new OutGamePlayerSpawnHandler(outGameEventManager);
    }
    async handleAfter(ev) {
        const { initialSpawn, player } = ev;
        const players = world.getPlayers();
        const alivePlayerIds = new Set(players.map((p) => p.id));
        const playersKairoData = (await KairoUtils.getPlayersKairoData())
            .filter((data) => alivePlayerIds.has(data.playerId))
            .sort((a, b) => a.joinOrder - b.joinOrder);
        const leaderPlayerId = playersKairoData[0]?.playerId;
        const isLeader = player.id === leaderPlayerId;
        this.outGameEventManager.getOutGameManager().initializePlayer(player, isLeader);
    }
}
