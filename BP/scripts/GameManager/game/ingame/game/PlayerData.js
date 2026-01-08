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
