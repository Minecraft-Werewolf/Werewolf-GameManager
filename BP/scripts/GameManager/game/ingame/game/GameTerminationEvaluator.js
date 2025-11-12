export var TerminationReason;
(function (TerminationReason) {
    TerminationReason[TerminationReason["None"] = 0] = "None";
    TerminationReason[TerminationReason["Annihilation"] = 1] = "Annihilation";
    TerminationReason[TerminationReason["Timeup"] = 2] = "Timeup";
    TerminationReason[TerminationReason["VillagerVictory"] = 3] = "VillagerVictory";
    TerminationReason[TerminationReason["WerewolfVictory"] = 4] = "WerewolfVictory";
    TerminationReason[TerminationReason["FoxesVictory"] = 5] = "FoxesVictory";
})(TerminationReason || (TerminationReason = {}));
export class GameTerminationEvaluator {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }
    static create(gameManager) {
        return new GameTerminationEvaluator(gameManager);
    }
    evaluate(playersData) {
        const aliveParticipants = playersData.filter((data) => data.isParticipating && data.isAlive);
        if (aliveParticipants.length === 0) {
            return TerminationReason.Annihilation;
        }
        return TerminationReason.None;
    }
}
