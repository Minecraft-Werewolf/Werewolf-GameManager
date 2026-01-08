import { HudElement, HudVisibility, InputPermissionCategory, world } from "@minecraft/server";
import { DEFAULT_SETTINGS } from "../../constants/settings";
import { CountdownManager } from "./utils/CountdownManager";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../constants/translate";
import { SYSTEMS } from "../../constants/systems";
import { GamePhase } from "./InGameManager";
export class GamePreparationManager {
    constructor(inGameManager) {
        this.inGameManager = inGameManager;
        this.countdownManager = CountdownManager.create(DEFAULT_SETTINGS.GAME_PREPARATION_TIME, DEFAULT_SETTINGS.VERBOSE_COUNTDOWN);
    }
    static create(inGameManager) {
        return new GamePreparationManager(inGameManager);
    }
    async runPreparationAsync() {
        this.inGameManager.setCurrentPhase(GamePhase.Preparing);
        const players = world.getPlayers();
        players.forEach((player) => {
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, true);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
            player.onScreenDisplay.setHudVisibility(HudVisibility.Reset, [HudElement.Crosshair]);
        });
        try {
            await this.countdownManager.startAsync({
                onNormalTick: (seconds) => {
                    world.sendMessage({
                        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_PREPARATION_COUNTDOWN_MESSAGE,
                        with: [seconds.toString()],
                    });
                    players.forEach((player) => {
                        player.playSound(SYSTEMS.GAME_PREPARATION_COUNTDOWN.SOUND_ID, {
                            location: player.location,
                            pitch: SYSTEMS.GAME_PREPARATION_COUNTDOWN.SOUND_PITCH,
                            volume: SYSTEMS.GAME_PREPARATION_COUNTDOWN.SOUND_VOLUME,
                        });
                    });
                },
                onWarningTick: (seconds) => {
                    world.sendMessage({
                        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_PREPARATION_COUNTDOWN_WARNING_MESSAGE,
                        with: [seconds.toString()],
                    });
                    players.forEach((player) => {
                        player.playSound(SYSTEMS.GAME_PREPARATION_COUNTDOWN.WARNING_SOUND_ID, {
                            location: player.location,
                            pitch: SYSTEMS.GAME_PREPARATION_COUNTDOWN.WARNING_SOUND_PITCH,
                            volume: SYSTEMS.GAME_PREPARATION_COUNTDOWN.WARNING_SOUND_VOLUME,
                        });
                    });
                },
                onComplete: () => {
                    world.sendMessage({
                        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_START_MESSAGE,
                    });
                    players.forEach((player) => {
                        player.playSound(SYSTEMS.GAME_START.SOUND_ID, {
                            location: player.location,
                            pitch: SYSTEMS.GAME_START.SOUND_PITCH,
                            volume: SYSTEMS.GAME_START.SOUND_VOLUME,
                        });
                    });
                },
            });
        }
        catch (err) {
            console.warn("[GamePreparationManager] Countdown stopped:", err);
            return;
        }
        players.forEach((player) => {
            player.onScreenDisplay.setHudVisibility(HudVisibility.Reset, [
                HudElement.Hotbar,
                HudElement.ItemText,
            ]);
        });
    }
    stopPreparation() {
        this.countdownManager.stop();
    }
}
