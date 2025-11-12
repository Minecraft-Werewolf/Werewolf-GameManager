import { EntityInventoryComponent, HudElement, HudVisibility, InputPermissionCategory, system, world } from "@minecraft/server";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../../constants/translate";
import { SYSTEMS } from "../../../../constants/systems";
import { MINECRAFT } from "../../../../constants/minecraft";
export class InitPresentation {
    constructor(gameInitializer) {
        this.gameInitializer = gameInitializer;
    }
    static create(gameInitializer) {
        return new InitPresentation(gameInitializer);
    }
    async runInitPresentationAsync(players) {
        try {
            await this.runStep(async () => this.showGameTitle(players));
            await this.runStep(async () => this.cameraBlackoutEffect(players));
            await this.runStep(() => this.teleportPlayers(players));
            await this.runStep(async () => this.showStageTitle(players));
        }
        catch (e) {
            console.warn(`[GameInitializer] Initialization interrupted: ${String(e)}`);
        }
    }
    async runStep(stepFn) {
        if (this.gameInitializer.isCancelled)
            throw new Error("Initialization cancelled");
        await stepFn();
    }
    async showGameTitle(players) {
        players.forEach((player) => {
            this.hideHudForPlayer(player);
            this.showGameTitleForPlayer(player);
            const inventoryComponent = player.getComponent(MINECRAFT.COMPONENT_ID_INVENTORY);
            inventoryComponent.container.clearAll();
            player.playSound(SYSTEMS.SHOW_TITLE_SOUND, {
                location: player.location,
                pitch: SYSTEMS.SHOW_TITLE_SOUND_PITCH,
                volume: SYSTEMS.SHOW_TITLE_SOUND_VOLUME,
            });
        });
        await this.gameInitializer.getWaitController().waitTicks(SYSTEMS.SHOW_TITLE_STAY_DURATION);
    }
    async cameraBlackoutEffect(players) {
        players.forEach((player) => {
            this.cameraBlackoutEffectForPlayer(player);
        });
        await this.gameInitializer.getWaitController().waitTicks(SYSTEMS.SHOW_TITLE_FADEOUT_DURATION);
    }
    teleportPlayers(players) {
        players.forEach((player) => {
            player.teleport({ x: 0.5, y: -58.94, z: 24.5 }, {
                checkForBlocks: false,
                dimension: world.getDimension("overworld"),
                // facingLocation: { x: 0, y: -58, z: 0 }, // rotationを指定しているため不要
                keepVelocity: false,
                rotation: { x: 16, y: 180 },
            });
        });
    }
    async showStageTitle(players) {
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
    hideHudForPlayer(player) {
        player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [
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
        ]);
    }
    showGameTitleForPlayer(player) {
        player.onScreenDisplay.setTitle({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_TITLE
        }, {
            subtitle: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_VERSION },
            fadeInDuration: SYSTEMS.SHOW_TITLE_FADEIN_DURATION,
            stayDuration: SYSTEMS.SHOW_TITLE_STAY_DURATION,
            fadeOutDuration: SYSTEMS.SHOW_TITLE_FADEOUT_DURATION,
        });
    }
    cameraBlackoutEffectForPlayer(player) {
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
    showStageTitleForPlayer(player) {
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
