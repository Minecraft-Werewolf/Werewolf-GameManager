import { HudElement, HudVisibility, InputPermissionCategory, Player, world } from "@minecraft/server";
import { DEFAULT_SETTINGS } from "../../constants/settings";
import { CountdownManager } from "./utils/CountdownManager";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../constants/translate";
import { SYSTEMS } from "../../constants/systems";
import { GamePhase, type InGameManager } from "./InGameManager";

export class GamePreparationManager {
    private readonly countdownManager: CountdownManager;
    private constructor(private readonly inGameManager: InGameManager) {
        this.countdownManager = CountdownManager.create(
            DEFAULT_SETTINGS.GAME_PREPARATION_TIME,
            DEFAULT_SETTINGS.VERBOSE_COUNTDOWN
        );
    }
    public static create(inGameManager: InGameManager): GamePreparationManager {
        return new GamePreparationManager(inGameManager);
    }

    public async runPreparationAsync(): Promise<void> {
        this.inGameManager.setCurrentPhase(GamePhase.Preparing);
        const players = world.getPlayers();

        players.forEach((player) => {
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, true);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
            player.onScreenDisplay.setHudVisibility(HudVisibility.Reset, [ HudElement.Crosshair ]);
        });

        try {
            await this.countdownManager.startAsync({
                onNormalTick: (seconds) => {
                    world.sendMessage({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_PREPARATION_COUNTDOWN_MESSAGE, with: [seconds.toString()] });
                    players.forEach((player) => {
                        player.playSound(SYSTEMS.GAME_PREPARATION_COUNTDOWN_SOUND, {
                            location: player.location,
                            pitch: SYSTEMS.GAME_PREPARATION_COUNTDOWN_SOUND_PITCH,
                            volume: SYSTEMS.GAME_PREPARATION_COUNTDOWN_SOUND_VOLUME
                        });
                    });
                },
                onWarningTick: (seconds) => {
                    world.sendMessage({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_PREPARATION_COUNTDOWN_WARNING_MESSAGE, with: [seconds.toString()] });
                    players.forEach((player) => {
                        player.playSound(SYSTEMS.GAME_PREPARATION_COUNTDOWN_WARNING_SOUND, {
                            location: player.location,
                            pitch: SYSTEMS.GAME_PREPARATION_COUNTDOWN_WARNING_SOUND_PITCH,
                            volume: SYSTEMS.GAME_PREPARATION_COUNTDOWN_WARNING_SOUND_VOLUME
                        });
                    });
                },
                onComplete: () => {
                    world.sendMessage({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_START_MESSAGE });
                    players.forEach((player) => {
                        player.playSound(SYSTEMS.GAME_START_SOUND, {
                            location: player.location,
                            pitch: SYSTEMS.GAME_START_SOUND_PITCH,
                            volume: SYSTEMS.GAME_START_SOUND_VOLUME
                        });
                    });
                }
            });

        } catch (err) {
            console.warn("[GamePreparationManager] Countdown stopped:", err);
            return;
        }

        players.forEach((player) => {
            player.onScreenDisplay.setHudVisibility(
                HudVisibility.Reset,
                [
                    HudElement.Hotbar,
                    HudElement.ItemText,
                ]
            );
        });
    }

    public stopPreparation(): void {
        this.countdownManager.stop();
    }
}