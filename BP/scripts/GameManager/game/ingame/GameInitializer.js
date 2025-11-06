import { HudElement, HudVisibility, Player, system, world } from "@minecraft/server";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../constants/translate";
import { SYSTEMS } from "../../constants/systems";
export class GameInitializer {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
    }
    static create(werewolfGameManager) {
        return new GameInitializer(werewolfGameManager);
    }
    async initialize() {
        const players = world.getPlayers();
        players.forEach((player) => {
            this.hideHudForPlayer(player);
            this.showGameTitleForPlayer(player);
        });
        const SUM_SHOW_TITLE_DURATION = SYSTEMS.SHOW_TITLE_FADEIN_DURATION
            + SYSTEMS.SHOW_TITLE_STAY_DURATION
            + SYSTEMS.SHOW_TITLE_FADEOUT_DURATION;
        await system.waitTicks(Math.floor(SUM_SHOW_TITLE_DURATION));
        players.forEach((player) => {
        });
    }
    hideHudForPlayer(player) {
        player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [
            HudElement.PaperDoll,
            HudElement.Armor,
            HudElement.ToolTips,
            // HudElement.TouchControls,
            // HudElement.Crosshair,
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
    }
}
