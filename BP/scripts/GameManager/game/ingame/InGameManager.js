import { world } from "@minecraft/server";
import { GamePreparationManager } from "./GamePreparationManager";
import { GameManager } from "./game/GameManager";
import { GameInitializer } from "./game/init/GameInitializer";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../constants/translate";
import { SYSTEMS } from "../../constants/systems";
import { InGameEventManager } from "./events/InGameEventManager";
import { GameTerminator } from "./game/terminate/GameTerminator";
export var GamePhase;
(function (GamePhase) {
    GamePhase[GamePhase["Initializing"] = 0] = "Initializing";
    GamePhase[GamePhase["Preparing"] = 1] = "Preparing";
    GamePhase[GamePhase["InGame"] = 2] = "InGame";
    GamePhase[GamePhase["Result"] = 3] = "Result";
    GamePhase[GamePhase["Waiting"] = 4] = "Waiting";
})(GamePhase || (GamePhase = {}));
export class InGameManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.currentPhase = GamePhase.Waiting;
        this.isResetRequested = false;
        this.gameInitializer = GameInitializer.create(this);
        this.gamePreparationManager = GamePreparationManager.create(this);
        this.gameManager = GameManager.create(this);
        this.gameTerminator = GameTerminator.create(this);
        this.inGameEventManager = InGameEventManager.create(this);
    }
    static create(systemManager) {
        return new InGameManager(systemManager);
    }
    async gameStart() {
        this.isResetRequested = false;
        try {
            await this.runStep(async () => this.gameInitializer.runInitializationAsync());
            await this.runStep(async () => this.gamePreparationManager.runPreparationAsync());
            await this.runStep(async () => this.gameManager.startGameAsync());
            console.log("aiue");
            await this.runStep(async () => this.gameTerminator.runTerminationAsync());
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
                this.gameManager.stopGame();
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
    getGameManager() {
        return this.gameManager;
    }
    getInGameEventManager() {
        return this.inGameEventManager;
    }
}
