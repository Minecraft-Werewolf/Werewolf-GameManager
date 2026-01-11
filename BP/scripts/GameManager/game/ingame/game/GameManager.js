import { world } from "@minecraft/server";
import { GamePhase, InGameManager } from "../InGameManager";
import { IntervalManager } from "../utils/IntervalManager";
import { ItemManager } from "./gameplay/ItemManager";
import { PlayersDataManager } from "./gameplay/PlayersDataManager";
import { GameTerminationEvaluator } from "./gameplay/GameTerminationEvaluator";
import { ActionBarManager } from "./gameplay/ActionBarManager";
import { PlayerData } from "./gameplay/PlayerData";
import { defaultGameOutcomeRules } from "../../../data/outcome";
export class GameManager {
    constructor(inGameManager) {
        this.inGameManager = inGameManager;
        this.isRunning = false;
        this.resolveFn = null;
        this.rejectFn = null;
        this._gameResult = null;
        this.onTickUpdate = () => {
            if (!this.isRunning)
                return;
            const players = world.getPlayers();
            const playersData = this.getPlayersData();
            this.actionBarManager.showActionBarToPlayers(players);
            this.itemManager.replaceItemToPlayers(players);
            // 終了判定
            const result = this.gameTerminationEvaluator.evaluate(playersData);
            if (result.type === "none")
                return;
            this._gameResult = result;
            playersData.forEach((playerData) => {
                if (result.outcome.type === "victory") {
                    playerData.isVictory = result.outcome.factionId === playerData.role?.factionId;
                }
            });
            this.finishGame();
        };
        this.onSecondUpdate = () => {
            if (!this.isRunning)
                return;
        };
        this.actionBarManager = ActionBarManager.create(this);
        this.intervalManager = IntervalManager.create();
        this.itemManager = ItemManager.create(this);
        this.gameTerminationEvaluator = GameTerminationEvaluator.create(this);
    }
    static create(inGameManager) {
        return new GameManager(inGameManager);
    }
    async startGameAsync() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.inGameManager.setCurrentPhase(GamePhase.InGame);
        return new Promise((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;
            this.intervalManager.tick.subscribe(this.onTickUpdate);
            this.intervalManager.second.subscribe(this.onSecondUpdate);
            this.intervalManager.startAll();
        });
    }
    stopGame() {
        if (!this.isRunning)
            return;
        this.rejectFn?.(new Error("Game cancelled"));
        this.cleanup();
    }
    finishGame() {
        if (!this.isRunning)
            return;
        this.resolveFn?.();
        this.cleanup();
    }
    get gameResult() {
        return this._gameResult;
    }
    cleanup() {
        this.intervalManager.clearAll();
        this.isRunning = false;
        this.resolveFn = null;
        this.rejectFn = null;
    }
    getPlayerData(playerId) {
        return this.inGameManager.getPlayerData(playerId);
    }
    getPlayersData() {
        return this.inGameManager.getPlayersData();
    }
    getPlayersDataManager() {
        return this.inGameManager.getPlayersDataManager();
    }
    getFactionDefinitions() {
        return this.inGameManager.getFactionDefinitions();
    }
    getDefaultOutcomeRules() {
        return defaultGameOutcomeRules;
    }
    getRemainingTime() {
        return 100; // 一旦100で返しておく
    }
}
