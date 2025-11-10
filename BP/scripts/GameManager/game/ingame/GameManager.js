import { world } from "@minecraft/server";
import { GamePreparationManager } from "./GamePreparationManager";
import { InGameManager } from "./InGameManager";
import { GameInitializer } from "./init/GameInitializer";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../constants/translate";
import { SYSTEMS } from "../../constants/systems";
export var GamePhase;
(function (GamePhase) {
    GamePhase[GamePhase["Initializing"] = 0] = "Initializing";
    GamePhase[GamePhase["Preparing"] = 1] = "Preparing";
    GamePhase[GamePhase["InGame"] = 2] = "InGame";
    GamePhase[GamePhase["Result"] = 3] = "Result";
    GamePhase[GamePhase["Waiting"] = 4] = "Waiting";
})(GamePhase || (GamePhase = {}));
export class GameManager {
    constructor() {
        this.currentPhase = GamePhase.Waiting;
        this.isResetRequested = false;
        this.gameInitializer = GameInitializer.create(this);
        this.gamePreparationManager = GamePreparationManager.create(this);
        this.inGameManager = InGameManager.create(this);
    }
    static create() {
        return new GameManager();
    }
    async gameStart() {
        this.isResetRequested = false;
        try {
            await this.runStep(async () => this.gameInitializer.runInitializationAsync());
            await this.runStep(async () => this.gamePreparationManager.runPreparationAsync());
            await this.runStep(async () => this.inGameManager.startGameAsync());
        }
        catch (e) {
            console.warn(`[GameManager] Game start interrupted: ${String(e)}`);
        }
    }
    async runStep(stepFn) {
        if (this.isResetRequested) {
            throw new Error("Game execution cancelled (reset requested)");
        }
        await stepFn();
    }
    gameReset() {
        if (this.isResetRequested)
            return;
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
    getCurrentPhase() {
        return this.currentPhase;
    }
    setCurrentPhase(phase) {
        this.currentPhase = phase;
    }
    isResetPending() {
        return this.isResetRequested;
    }
}
