import { world } from "@minecraft/server";
import { GamePreparationManager } from "./GamePreparationManager";
import { InGameManager } from "./InGameManager";
import { GameInitializer } from "./init/GameInitializer";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../constants/translate";
import { SYSTEMS } from "../../constants/systems";

export enum GamePhase {
    Initializing,
    Preparing,
    InGame,
    Result,
    Waiting,
}

export class GameManager {
    private currentPhase: GamePhase = GamePhase.Waiting;

    private readonly gameInitializer: GameInitializer;
    private readonly gamePreparationManager: GamePreparationManager;
    private readonly inGameManager: InGameManager;

    private isResetRequested = false;

    private constructor() {
        this.gameInitializer = GameInitializer.create(this);
        this.gamePreparationManager = GamePreparationManager.create(this);
        this.inGameManager = InGameManager.create(this);
    }

    public static create(): GameManager {
        return new GameManager();
    }

    public async gameStart(): Promise<void> {
        this.isResetRequested = false;

        try {
            await this.runStep(async () => this.gameInitializer.runInitializationAsync());
            await this.runStep(async () => this.gamePreparationManager.runPreparationAsync());
            await this.runStep(async () => this.inGameManager.startGameAsync());
        } catch (e) {
            console.warn(`[GameManager] Game start interrupted: ${String(e)}`);
        }
    }

    private async runStep(stepFn: () => Promise<void> | void): Promise<void> {
        if (this.isResetRequested) {
            throw new Error("Game execution cancelled (reset requested)");
        }
        await stepFn();
    }

    public gameReset(): void {
        if (this.isResetRequested) return;
        this.isResetRequested = true;

        switch (this.currentPhase) {
            case GamePhase.Initializing:
                this.gameInitializer.cancel();
                world.sendMessage({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_START_CANCELD_MESSAGE });
                break;
            case GamePhase.Preparing:
                this.gamePreparationManager.stopPreparation();
                world.sendMessage({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_START_CANCELD_MESSAGE });
                break;
            case GamePhase.InGame:
                this.inGameManager.stopGame();
                world.sendMessage({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_FORCE_QUIT_MESSAGE });
                break;
            case GamePhase.Result:
                world.sendMessage({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_FORCE_QUIT_MESSAGE });
                break;
            case GamePhase.Waiting:
                break;
        }

        this.setCurrentPhase(GamePhase.Waiting);

        world.getPlayers().forEach((player) => {
            player.playSound(SYSTEMS.GAME_FORCE_QUIT_SOUND, {
                location: player.location,
                pitch: SYSTEMS.GAME_FORCE_QUIT_SOUND_PITCH,
                volume: SYSTEMS.GAME_FORCE_QUIT_SOUND_VOLUME
            });
        
        });
    }

    public getCurrentPhase(): GamePhase {
        return this.currentPhase;
    }

    public setCurrentPhase(phase: GamePhase): void {
        this.currentPhase = phase;
    }

    public isResetPending(): boolean {
        return this.isResetRequested;
    }
}
