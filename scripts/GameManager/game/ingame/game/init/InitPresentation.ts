import { HudElement, HudVisibility, InputPermissionCategory, system, world, type Player } from "@minecraft/server";
import type { GameInitializer } from "./GameInitializer";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../../constants/translate";
import { SYSTEMS } from "../../../../constants/systems";

export class InitPresentation {
    private constructor(private readonly gameInitializer: GameInitializer) {}
    public static create(gameInitializer: GameInitializer): InitPresentation {
        return new InitPresentation(gameInitializer);
    }

    public async showGameTitle(players: Player[]): Promise<void> {
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

        await this.gameInitializer.getWaitController().waitTicks(SYSTEMS.SHOW_TITLE_STAY_DURATION);
    }

    public async cameraBlackoutEffect(players: Player[]): Promise<void> {
        players.forEach((player) => {
            this.cameraBlackoutEffectForPlayer(player);
        });

        await this.gameInitializer.getWaitController().waitTicks(SYSTEMS.SHOW_TITLE_FADEOUT_DURATION);
    }

    public async showStageTitle(players: Player[]): Promise<void> {
        players.forEach((player) => {
            this.showStageTitleForPlayer(player);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, false);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
            player.playSound(SYSTEMS.SHOW_STAGE_TITLE_SOUND, {
                location: player.location,
                pitch: SYSTEMS.SHOW_STAGE_TITLE_SOUND_PITCH,
                volume: SYSTEMS.SHOW_STAGE_TITLE_SOUND_VOLUME,
            });
        });

        await this.gameInitializer.getWaitController().waitTicks(SYSTEMS.SHOW_STAGE_TITLE_BACKGROUND_HOLD_TIME * SYSTEMS.INTERVAL_EVERY_SECOND);
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
        );
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
                fadeInTime: SYSTEMS.SHOW_STAGE_TITLE_BACKGROUND_FADEIN_TIME,
                holdTime: SYSTEMS.SHOW_STAGE_TITLE_BACKGROUND_HOLD_TIME,
                fadeOutTime: SYSTEMS.SHOW_STAGE_TITLE_BACKGROUND_FADEOUT_TIME,
            }
        });
    }

    private showStageTitleForPlayer(player: Player): void {
        player.onScreenDisplay.setTitle({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_STAGE_TITLE
        }, {
            subtitle: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_STAGE_LOADING },
            fadeInDuration: SYSTEMS.SHOW_STAGE_TITLE_FADEIN_DURATION,
            stayDuration: SYSTEMS.SHOW_STAGE_TITLE_STAY_DURATION,
            fadeOutDuration: SYSTEMS.SHOW_STAGE_TITLE_FADEOUT_DURATION,
        });
    }
}