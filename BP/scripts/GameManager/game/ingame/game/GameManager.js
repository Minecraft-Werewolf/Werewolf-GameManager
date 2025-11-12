import { world } from "@minecraft/server";
import { GamePhase, InGameManager } from "../InGameManager";
import { IntervalManager } from "../utils/IntervalManager";
import { ItemManager } from "./ItemManager";
import { PlayerData, PlayersDataManager } from "./PlayersDataManager";
import { GameTerminationEvaluator, TerminationReason } from "./GameTerminationEvaluator";
export class GameManager {
    constructor(inGameManager) {
        this.inGameManager = inGameManager;
        this.isRunning = false;
        this.resolveFn = null;
        this.rejectFn = null;
        this.onTickUpdate = () => {
            if (!this.isRunning)
                return;
            const players = world.getPlayers();
            const playersData = this.getPlayersData();
            this.itemManager.replaceItemToPlayers(players);
            // 終了判定
            const evaluateResult = this.gameTerminationEvaluator.evaluate(playersData);
            if (evaluateResult === TerminationReason.None)
                return;
            this.finishGame();
        };
        this.onSecondUpdate = () => {
            if (!this.isRunning)
                return;
        };
        this.intervalManager = IntervalManager.create();
        this.itemManager = ItemManager.create(this);
        this.gameTerminationEvaluator = GameTerminationEvaluator.create(this);
        this.playersDataManager = PlayersDataManager.create(this);
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
    cleanup() {
        this.intervalManager.clearAll();
        this.isRunning = false;
        this.resolveFn = null;
        this.rejectFn = null;
    }
    getPlayerData(playerId) {
        return this.playersDataManager.get(playerId);
    }
    getPlayersData() {
        return this.playersDataManager.getPlayersData();
    }
    getPlayersDataManager() {
        return this.playersDataManager;
    }
}
