export class PlayerData {
    constructor(playerDataManager, player, state = "participant") {
        this.playerDataManager = playerDataManager;
        this.player = player;
        this.state = state;
        this.isAlive = true;
        this.isVictory = false;
        this.role = null;
        this.skillStates = new Map();
        this.name = player.name;
    }
    get isParticipating() {
        return this.state === "participant";
    }
    setRole(role) {
        this.role = role;
        this.initSkillStates();
        const faction = this.playerDataManager
            .getInGameManager()
            .getFactionData(this.role.factionId);
        if (!faction)
            return;
        if (this.role.color === undefined) {
            this.role.color = faction.defaultColor;
        }
    }
    initSkillStates() {
        this.skillStates.clear();
        if (!this.role?.skills)
            return;
        const gameManager = this.playerDataManager.getInGameManager();
        for (const skill of this.role.skills) {
            // number | string なので、string の場合の解決を後に作る必要がある
            // const cooldown = gameManager.resolveSkillValue(skill.cooldown);
            // const maxUses = gameManager.resolveSkillValue(skill.maxUses);
            this.skillStates.set(skill.id, {
                name: skill.name,
                cooldownRemaining: 0,
                remainingUses: 3, // とりあえず3で固定しておく
            });
        }
    }
}
