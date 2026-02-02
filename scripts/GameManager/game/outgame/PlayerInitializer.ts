import {
    EntityComponentTypes,
    GameMode,
    HudElement,
    HudVisibility,
    ItemStack,
    type Player,
} from "@minecraft/server";
import type { OutGameManager } from "./OutGameManager";
import { ITEM_USE } from "../../constants/itemuse";
import { SYSTEMS } from "../../constants/systems";

export class PlayerInitializer {
    private constructor(private readonly outGameManager: OutGameManager) {}
    public static create(outGameManager: OutGameManager) {
        return new PlayerInitializer(outGameManager);
    }

    public initializePlayer(player: Player, isHost: boolean): void {
        const wantsToJoinNextGame = player.getDynamicProperty("wantsToJoinNextGame") ?? true;
        player.setDynamicProperty("wantsToJoinNextGame", wantsToJoinNextGame);

        // ゲームモード
        player.setGameMode(GameMode.Adventure);

        // Hud
        player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [
            HudElement.PaperDoll,
            HudElement.Armor,
            HudElement.ToolTips,
            HudElement.ProgressBar,
            HudElement.Hunger,
            HudElement.AirBubbles,
            HudElement.HorseHealth,
            HudElement.StatusEffects,
        ]);

        player.onScreenDisplay.setHudVisibility(HudVisibility.Reset, [
            HudElement.Crosshair,
            HudElement.Health,
            HudElement.Hotbar,
            HudElement.ItemText,
            HudElement.TouchControls,
        ]);

        // インベントリ関連
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory) return;

        inventory.container.clearAll();
        inventory.container.setItem(
            SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.PERSONAL_SETTINGS,
            new ItemStack(ITEM_USE.PERSONAL_SETTINGS_ITEM_ID, 1),
        );

        if (wantsToJoinNextGame)
            inventory.container.setItem(
                SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_SPECTATE,
                new ItemStack(ITEM_USE.GAME_SPECTATE_ITEM_ID, 1),
            );
        else
            inventory.container.setItem(
                SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_JOIN,
                new ItemStack(ITEM_USE.GAME_JOIN_ITEM_ID, 1),
            );

        if (isHost) {
            inventory.container.setItem(
                SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_STARTER,
                new ItemStack(ITEM_USE.GAME_STARTER_ITEM_ID, 1),
            );

            inventory.container.setItem(
                SYSTEMS.OUT_GAME_ITEM_SLOT_INDEX.GAME_SETTINGS,
                new ItemStack(ITEM_USE.GAME_SETTINGS_ITEM_ID, 1),
            );
        }
    }
}
