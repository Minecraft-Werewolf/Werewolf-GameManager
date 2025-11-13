export class PlayerData {
    constructor(player, state = "participant") {
        this.player = player;
        this.state = state;
        this.isAlive = true;
        this.isVictory = false;
        this.name = player.name;
    }
    get isParticipating() {
        return this.state === "participant";
    }
}
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
