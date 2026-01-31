import { world } from "@minecraft/server";
import { OutGameEventManager } from "./events/OutGameEventManager";
import { PlayerInitializer } from "./PlayerInitializer";
import { KairoUtils } from "../../../Kairo/utils/KairoUtils";
export class OutGameManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.outGameEventManager = OutGameEventManager.create(this);
        this.playerInitializer = PlayerInitializer.create(this);
        this.init();
    }
    static create(systemManager) {
        return new OutGameManager(systemManager);
    }
    async init() {
        const players = world.getPlayers();
        const playersKairoData = await KairoUtils.getPlayersKairoData();
        players
            .sort((a, b) => {
            const dataA = playersKairoData.find((data) => data.playerId === a.id);
            const dataB = playersKairoData.find((data) => data.playerId === b.id);
            if (!dataA || !dataB)
                return 0;
            return dataA.joinOrder - dataB.joinOrder;
        })
            .forEach((player, index) => {
            this.initializePlayer(player, index === 0);
        });
    }
    startGame() {
        this.systemManager.startGame();
    }
    getOutGameEventManager() {
        return this.outGameEventManager;
    }
    initializePlayer(player, isHost) {
        this.playerInitializer.initializePlayer(player, isHost);
    }
    openSettingsForm(player) {
        this.systemManager.openSettingsForm(player);
    }
}
