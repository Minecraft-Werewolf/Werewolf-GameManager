import { ConditionNormalizer } from "./ConditionNormalizer";
export class GameTerminationEvaluator {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.conditonNormalizer = ConditionNormalizer.create(this);
    }
    static create(gameManager) {
        return new GameTerminationEvaluator(gameManager);
    }
    evaluate(playersData) {
        const context = this.buildContext(playersData);
        const rules = [
            ...this.gameManager.getDefaultOutcomeRules(),
            ...this.buildFactionVictoryRules(),
        ];
        const satisfied = rules
            .filter((rule) => this.evaluateCondition(rule.condition, context))
            .sort((a, b) => b.priority - a.priority);
        if (satisfied.length === 0) {
            return { type: "none" };
        }
        const winner = satisfied[0];
        if (!winner) {
            return { type: "none" };
        }
        return {
            type: "resolved",
            ruleId: winner.id,
            outcome: winner.outcome,
            presentation: winner.presentation,
        };
    }
    evaluateCondition(condition, context) {
        const normalized = this.conditonNormalizer.normalizeCondition(condition);
        return this.conditonNormalizer.evalNormalized(normalized, context);
    }
    buildContext(playersData) {
        const alive = playersData.filter((p) => p.isParticipating && p.isAlive);
        const aliveCountByFaction = {};
        for (const p of alive) {
            const role = p.role;
            if (!role)
                continue;
            // 狂人枠はカウントしない
            if (role.isExcludedFromSurvivalCheck === true)
                continue;
            const factionId = role.factionId;
            aliveCountByFaction[factionId] = (aliveCountByFaction[factionId] ?? 0) + 1;
        }
        return {
            remainingTime: this.gameManager.getRemainingTime(),
            alivePlayerCount: alive.length,
            aliveCountByFaction,
        };
    }
    buildFactionVictoryRules() {
        return this.gameManager.getFactionDefinitions().map((faction) => ({
            id: `victory:${faction.id}`,
            priority: faction.victoryCondition.priority,
            condition: faction.victoryCondition.condition,
            outcome: {
                type: "victory",
                factionId: faction.id,
            },
            presentation: faction.victoryCondition.presentation,
        }));
    }
    getGameManager() {
        return this.gameManager;
    }
}
