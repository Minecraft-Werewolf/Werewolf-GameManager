import { world, type RawMessage } from "@minecraft/server";
import { GamePhase, InGameManager } from "../InGameManager";
import { IntervalManager } from "../utils/IntervalManager";
import { ItemManager } from "./gameplay/ItemManager";
import { PlayersDataManager } from "./gameplay/PlayersDataManager";
import { GameTerminationEvaluator } from "./gameplay/GameTerminationEvaluator";
import { ActionBarManager } from "./gameplay/ActionBarManager";
import { PlayerData } from "./gameplay/PlayerData";
import type { GameOutcome } from "../../../data/types/conditions";
import { defaultGameOutcomeRules, type GameOutcomeRule } from "../../../data/outcome";

export interface ResolvedGameOutcome {
    type: "resolved";
    ruleId: string;
    outcome: GameOutcome;
    presentation: {
        title: RawMessage;
        message: RawMessage;
    };
}

export class GameManager {
    private readonly actionBarManager: ActionBarManager;
    private readonly intervalManager: IntervalManager;
    private readonly itemManager: ItemManager;
    private readonly gameTerminationEvaluator: GameTerminationEvaluator;

    private isRunning = false;
    private resolveFn: (() => void) | null = null;
    private rejectFn: ((reason?: any) => void) | null = null;

    private _gameResult: ResolvedGameOutcome | null = null;

    private constructor(private readonly inGameManager: InGameManager) {
        this.actionBarManager = ActionBarManager.create(this);
        this.intervalManager = IntervalManager.create();
        this.itemManager = ItemManager.create(this);
        this.gameTerminationEvaluator = GameTerminationEvaluator.create(this);
    }

    public static create(inGameManager: InGameManager): GameManager {
        return new GameManager(inGameManager);
    }

    public async startGameAsync(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;

        this.inGameManager.setCurrentPhase(GamePhase.InGame);

        return new Promise<void>((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;

            this.intervalManager.tick.subscribe(this.onTickUpdate);
            this.intervalManager.second.subscribe(this.onSecondUpdate);
            this.intervalManager.startAll();
        });
    }

    public stopGame(): void {
        if (!this.isRunning) return;
        this.rejectFn?.(new Error("Game cancelled"));
        this.cleanup();
    }

    public finishGame(): void {
        if (!this.isRunning) return;
        this.resolveFn?.();
        this.cleanup();
    }

    private onTickUpdate = (): void => {
        if (!this.isRunning) return;
        const players = world.getPlayers();
        const playersData = this.getPlayersData();

        this.actionBarManager.showActionBarToPlayers(players);
        this.itemManager.replaceItemToPlayers(players);

        // 終了判定
        const result = this.gameTerminationEvaluator.evaluate(playersData);
        if (result.type === "none") return;

        this._gameResult = result;
        playersData.forEach((playerData) => {
            if (result.outcome.type === "victory") {
                playerData.isVictory = result.outcome.factionId === playerData.role?.factionId;
            }
        });

        this.finishGame();
    };

    public get gameResult(): ResolvedGameOutcome | null {
        return this._gameResult;
    }

    private onSecondUpdate = (): void => {
        if (!this.isRunning) return;
    };

    private cleanup(): void {
        this.intervalManager.clearAll();
        this.isRunning = false;
        this.resolveFn = null;
        this.rejectFn = null;
    }

    public getPlayerData(playerId: string) {
        return this.inGameManager.getPlayerData(playerId);
    }

    public getPlayersData(): readonly PlayerData[] {
        return this.inGameManager.getPlayersData();
    }

    public getPlayersDataManager(): PlayersDataManager {
        return this.inGameManager.getPlayersDataManager();
    }

    public getFactionDefinitions() {
        return this.inGameManager.getFactionDefinitions();
    }

    public getDefaultOutcomeRules(): GameOutcomeRule[] {
        return defaultGameOutcomeRules;
    }

    public getRemainingTime(): number {
        return 100; // 一旦100で返しておく
    }
}
