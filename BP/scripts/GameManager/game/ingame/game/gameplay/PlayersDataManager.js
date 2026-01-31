import { PlayerData } from "./PlayerData";
export class PlayersDataManager {
    constructor(werewolfGameDataManager) {
        this.werewolfGameDataManager = werewolfGameDataManager;
        this.dataMap = new Map();
    }
    static create(werewolfGameDataManager) {
        return new PlayersDataManager(werewolfGameDataManager);
    }
    init(player, state = "participant") {
        if (this.dataMap.has(player.id))
            return;
        this.dataMap.set(player.id, new PlayerData(this, player, state));
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
    getInGameManager() {
        return this.werewolfGameDataManager.getInGameManager();
    }
}
