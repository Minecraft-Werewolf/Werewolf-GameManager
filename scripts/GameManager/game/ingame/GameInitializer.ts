import { HudElement, HudVisibility, InputPermissionCategory, Player, system, world } from "@minecraft/server";
import type { WerewolfGameManager } from "../WerewolfGameManager";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../constants/translate";
import { SYSTEMS } from "../../constants/systems";

export class GameInitializer {
    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {}
    public static create(werewolfGameManager: WerewolfGameManager): GameInitializer {
        return new GameInitializer(werewolfGameManager);
    }

    public async runInitializationAsync(): Promise<void> {
        const players = world.getPlayers();
        players.forEach((player) => {
            this.hideHudForPlayer(player);
            this.showGameTitleForPlayer(player);
            player.getComponent("inventory")?.container.clearAll();
            player.playSound(SYSTEMS.SHOW_TITLE_SOUND, {
                location: player.location,
                pitch: SYSTEMS.SHOW_TITLE_SOUND_PITCH,
                volume: SYSTEMS.SHOW_TITLE_SOUND_VOLUME,
            });
        });

        await system.waitTicks(Math.floor(SYSTEMS.SHOW_TITLE_STAY_DURATION));

        players.forEach((player) => {
            this.cameraBlackoutEffectForPlayer(player);
        });

        await system.waitTicks(Math.floor(SYSTEMS.SHOW_TITLE_FADEOUT_DURATION));

        players.forEach((player) => {
            this.showMapTitleForPlayer(player);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, false);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
            player.playSound(SYSTEMS.SHOW_MAP_TITLE_SOUND, {
                location: player.location,
                pitch: SYSTEMS.SHOW_MAP_TITLE_SOUND_PITCH,
                volume: SYSTEMS.SHOW_MAP_TITLE_SOUND_VOLUME,
            });
        });

        await system.waitTicks(Math.floor(SYSTEMS.SHOW_MAP_TITLE_BACKGROUND_HOLD_TIME));
    }

    private hideHudForPlayer(player: Player): void {
        player.onScreenDisplay.setHudVisibility(
            HudVisibility.Hide,
            [
                HudElement.PaperDoll,
                HudElement.Armor,
                HudElement.ToolTips,
                // HudElement.TouchControls,
                HudElement.Crosshair,
                HudElement.Hotbar,
                HudElement.Health,
                HudElement.ProgressBar,
                HudElement.Hunger,
                HudElement.AirBubbles,
                HudElement.HorseHealth,
                HudElement.StatusEffects,
                HudElement.ItemText,
            ]
        )
    }

    private showGameTitleForPlayer(player: Player): void {
        player.onScreenDisplay.setTitle({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_TITLE
        }, {
            subtitle: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_VERSION },
            fadeInDuration: SYSTEMS.SHOW_TITLE_FADEIN_DURATION,
            stayDuration: SYSTEMS.SHOW_TITLE_STAY_DURATION,
            fadeOutDuration: SYSTEMS.SHOW_TITLE_FADEOUT_DURATION,
        });
    }

    private cameraBlackoutEffectForPlayer(player: Player): void {
        player.camera.fade({
            fadeColor: {
                blue: 0,
                green: 0,
                red: 0,
            },
            fadeTime: {
                fadeInTime: SYSTEMS.SHOW_MAP_TITLE_BACKGROUND_FADEIN_TIME,
                holdTime: SYSTEMS.SHOW_MAP_TITLE_BACKGROUND_HOLD_TIME,
                fadeOutTime: SYSTEMS.SHOW_MAP_TITLE_BACKGROUND_FADEOUT_TIME,
            }
        });
    }

    private showMapTitleForPlayer(player: Player): void {
        player.onScreenDisplay.setTitle({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_MAP_TITLE
        }, {
            fadeInDuration: SYSTEMS.SHOW_MAP_TITLE_FADEIN_DURATION,
            stayDuration: SYSTEMS.SHOW_MAP_TITLE_STAY_DURATION,
            fadeOutDuration: SYSTEMS.SHOW_MAP_TITLE_FADEOUT_DURATION,
        });
    }
}