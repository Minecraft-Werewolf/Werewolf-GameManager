import { InputPermissionCategory, world } from "@minecraft/server";
import { DEFAULT_SETTINGS } from "../../constants/settings";
import { CountdownManager } from "./utils/CountdownManager";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../constants/translate";
import { SYSTEMS } from "../../constants/systems";
export class GamePreparationManager {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
    }
    static create(werewolfGameManager) {
        return new GamePreparationManager(werewolfGameManager);
    }
    async runPreparationAsync() {
        const players = world.getPlayers();
        players.forEach((player) => {
            player.teleport({ x: 0.5, y: -58.94, z: 24.5 }, {
                checkForBlocks: false,
                dimension: world.getDimension("overworld"),
                // facingLocation: { x: 0, y: -58, z: 0 }, // rotationを指定しているため不要
                keepVelocity: false,
                rotation: { x: 16, y: 180 },
            });
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, true);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
        });
        const countdown = CountdownManager.create(DEFAULT_SETTINGS.GAME_PREPARATION_TIME);
        await countdown.startAsync({
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
    }
}
