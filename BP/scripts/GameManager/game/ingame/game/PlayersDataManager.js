import { PlayerData } from "./PlayerData";
export class PlayersDataManager {
    constructor(inGameManager) {
        this.inGameManager = inGameManager;
        this.dataMap = new Map();
    }
    static create(inGameManager) {
        return new PlayersDataManager(inGameManager);
    }
    init(player, state = "participant") {
        if (this.dataMap.has(player.id))
            return;
        this.dataMap.set(player.id, new PlayerData(player, state));
    }
    get(playerId) {
        return this.dataMap.get(playerId);
    }
    getByPlayer(player) {
        return this.dataMap.get(player.id);
    }
    getPlayersData() {
        return Array.from(this.dataMap.values());
    }
    remove(playerId) {
        this.dataMap.delete(playerId);
    }
    clearAll() {
        this.dataMap.clear();
    }
}
