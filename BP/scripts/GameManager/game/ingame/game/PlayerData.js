export class PlayerData {
    constructor(playerDataManager, player, state = "participant") {
        this.playerDataManager = playerDataManager;
        this.player = player;
        this.state = state;
        this.isAlive = true;
        this.isVictory = false;
        this.role = null;
        this.name = player.name;
    }
    get isParticipating() {
        return this.state === "participant";
    }
    setRole(role) {
        this.role = role;
        const faction = this.playerDataManager
            .getInGameManager()
            .getFactionData(this.role.factionId);
        if (!faction)
            return;
        if (this.role.color === undefined) {
            this.role.color = faction.defaultColor;
        }
    }
}
