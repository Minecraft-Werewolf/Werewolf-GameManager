import type { Player } from "@minecraft/server";
import { ROOT_SETTINGS, type SettingCategoryNode } from "../../../data/settings";
import { RoleCompositionManager } from "./RoleCompositionManager";
import { SettingTreeManager } from "./SettingTreeManager";
import { SettingUIManager } from "./SettingUIManager";
import type { OutGameManager } from "../OutGameManager";

export class GameSettingManager {
    private readonly roleCompositionManager: RoleCompositionManager;
    private readonly settingTreeManager: SettingTreeManager;
    private readonly settingUIManager: SettingUIManager;
    private readonly rootSettingCategory: SettingCategoryNode;

    private constructor(private readonly outGameManager: OutGameManager) {
        this.roleCompositionManager = RoleCompositionManager.create(this);
        this.settingTreeManager = SettingTreeManager.create(this);
        this.settingUIManager = SettingUIManager.create(this);
        this.rootSettingCategory = ROOT_SETTINGS;
    }
    public static create(outGameManager: OutGameManager): GameSettingManager {
        return new GameSettingManager(outGameManager);
    }

    public async opneSettingsForm(player: Player): Promise<void> {
        return this.settingUIManager.open(player);
    }

    public async openFormRoleComposition(playerId: string): Promise<void> {
        return this.roleCompositionManager.open(playerId);
    }

    public getRoot(): SettingCategoryNode {
        return this.rootSettingCategory;
    }

    public getDefinitions<T>(
        addonListSaveKey: string,
        definitionSaveKeyPrefix: string,
    ): Promise<T[]> {
        return this.outGameManager.getDefinitions<T>(addonListSaveKey, definitionSaveKeyPrefix);
    }

    public getDefinitionsMap<T>(
        addonListSaveKey: string,
        definitionSaveKeyPrefix: string,
    ): Promise<Map<string, T[]>> {
        return this.outGameManager.getDefinitionsMap<T>(addonListSaveKey, definitionSaveKeyPrefix);
    }
}
