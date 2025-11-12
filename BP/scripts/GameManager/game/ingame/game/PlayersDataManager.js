export class PlayerData {
    constructor(playerId, state = "participant") {
        this.playerId = playerId;
        this.state = state;
        this.isAlive = true;
    }
    get isParticipating() {
        return this.state === "participant";
    }
}
export class PlayersDataManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.dataMap = new Map();
    }
    static create(gameManager) {
        return new PlayersDataManager(gameManager);
    }
    init(playerId, state = "participant") {
        if (this.dataMap.has(playerId))
            return;
        this.dataMap.set(playerId, new PlayerData(playerId, state));
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
