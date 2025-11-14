import { EntityInventoryComponent, HudElement, HudVisibility, InputPermissionCategory, system, world, type Player } from "@minecraft/server";
import type { GameInitializer } from "./GameInitializer";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../../constants/translate";
import { SYSTEMS } from "../../../../constants/systems";
import { MINECRAFT } from "../../../../constants/minecraft";

export class InitPresentation {
    private constructor(private readonly gameInitializer: GameInitializer) {}
    public static create(gameInitializer: GameInitializer): InitPresentation {
        return new InitPresentation(gameInitializer);
    }

    public async runInitPresentationAsync(players: Player[]): Promise<void> {
        try {
            await this.runStep(async () => this.showGameTitle(players));
            await this.runStep(async () => this.cameraBlackoutEffect(players));
            await this.runStep(() => this.teleportPlayers(players));
            await this.runStep(async () => this.showStageTitle(players));
        } catch (e) {
            console.warn(`[GameInitializer] Initialization interrupted: ${String(e)}`);
        }
    }

    private async runStep(stepFn: () => Promise<void> | void): Promise<void> {
        if (this.gameInitializer.isCancelled) throw new Error("Initialization cancelled");
        await stepFn();
    }

    private async showGameTitle(players: Player[]): Promise<void> {
        players.forEach((player) => {
            this.hideHudForPlayer(player);
            this.showGameTitleForPlayer(player);
            const inventoryComponent = player.getComponent(MINECRAFT.COMPONENT_ID_INVENTORY) as EntityInventoryComponent;
            inventoryComponent.container.clearAll();
            player.playSound(SYSTEMS.SHOW_GAME_TITLE.SOUND_ID, {
                location: player.location,
                pitch: SYSTEMS.SHOW_GAME_TITLE.SOUND_PITCH,
                volume: SYSTEMS.SHOW_GAME_TITLE.SOUND_VOLUME,
            });
        });

        await this.gameInitializer.getWaitController().waitTicks(SYSTEMS.SHOW_GAME_TITLE.STAY_DURATION);
    }

    private async cameraBlackoutEffect(players: Player[]): Promise<void> {
        players.forEach((player) => {
            this.cameraBlackoutEffectForPlayer(player);
        });

        await this.gameInitializer.getWaitController().waitTicks(SYSTEMS.SHOW_GAME_TITLE.FADEOUT_DURATION);
    }

    private teleportPlayers(players: Player[]): void {
        players.forEach((player) => {
            player.teleport(
                {
                    x: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.X,
                    y: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.Y,
                    z: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.Z,
                },
                {
                    checkForBlocks: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.CHECK_FOR_BLOCKS,
                    dimension: world.getDimension(SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.DIMENSION),
                    // facingLocation: { x: 0, y: -58, z: 0 }, // rotationを指定しているため不要
                    keepVelocity: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.KEEP_VELOCITY,
                    rotation: {
                        x: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.ROTATION_X,
                        y: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.ROTATION_Y,
                    },
                }
            );
        });
    }

    private async showStageTitle(players: Player[]): Promise<void> {
        players.forEach((player) => {
            this.showStageTitleForPlayer(player);
            player.playSound(SYSTEMS.SHOW_STAGE_TITLE.SOUND_ID, {
                location: player.location,
                pitch: SYSTEMS.SHOW_STAGE_TITLE.SOUND_PITCH,
                volume: SYSTEMS.SHOW_STAGE_TITLE.SOUND_VOLUME,
            });
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, false);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
        });

        await this.gameInitializer.getWaitController().waitTicks(SYSTEMS.SHOW_STAGE_TITLE.BACKGROUND_HOLD_TIME * SYSTEMS.INTERVAL.EVERY_SECOND);
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
            fadeInDuration: SYSTEMS.SHOW_GAME_TITLE.FADEIN_DURATION,
            stayDuration: SYSTEMS.SHOW_GAME_TITLE.STAY_DURATION,
            fadeOutDuration: SYSTEMS.SHOW_GAME_TITLE.FADEOUT_DURATION,
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
                fadeInTime: SYSTEMS.SHOW_STAGE_TITLE.BACKGROUND_FADEIN_TIME,
                holdTime: SYSTEMS.SHOW_STAGE_TITLE.BACKGROUND_HOLD_TIME,
                fadeOutTime: SYSTEMS.SHOW_STAGE_TITLE.BACKGROUND_FADEOUT_TIME,
            }
        });
    }

    private showStageTitleForPlayer(player: Player): void {
        player.onScreenDisplay.setTitle({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_STAGE_TITLE
        }, {
            subtitle: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_STAGE_LOADING },
            fadeInDuration: SYSTEMS.SHOW_STAGE_TITLE.FADEIN_DURATION,
            stayDuration: SYSTEMS.SHOW_STAGE_TITLE.STAY_DURATION,
            fadeOutDuration: SYSTEMS.SHOW_STAGE_TITLE.FADEOUT_DURATION,
        });
    }
}