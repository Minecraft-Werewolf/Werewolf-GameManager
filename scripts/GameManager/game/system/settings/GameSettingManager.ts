import type { Player } from "@minecraft/server";
import { ROOT_SETTINGS, type SettingCategoryNode } from "../../../data/settings";
import type { SystemManager } from "../../SystemManager";
import { RoleCompositionManager } from "./RoleCompositionManager";
import { SettingTreeManager } from "./SettingTreeManager";
import { SettingUIManager } from "./SettingUIManager";
import type { RoleDefinition } from "../../../data/roles";
import type { FactionDefinition } from "../../../data/factions";

export class GameSettingManager {
    private readonly roleCompositionManager: RoleCompositionManager;
    private readonly settingTreeManager: SettingTreeManager;
    private readonly settingUIManager: SettingUIManager;
    private readonly rootSettingCategory: SettingCategoryNode;

    private constructor(private readonly systemManager: SystemManager) {
        this.roleCompositionManager = RoleCompositionManager.create(this);
        this.settingTreeManager = SettingTreeManager.create(this);
        this.settingUIManager = SettingUIManager.create(this);
        this.rootSettingCategory = ROOT_SETTINGS;
    }
    public static create(systemManager: SystemManager): GameSettingManager {
        return new GameSettingManager(systemManager);
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

    public getRegisteredRoleDefinitions(): Map<string, RoleDefinition[]> {
        return this.systemManager.getRegisteredRoleDefinitions();
    }

    public getSelectedRolesForNextGame(): RoleDefinition[] {
        return this.systemManager.getSelectedRolesForNextGame();
    }

    public getFactionData(factionId: string): FactionDefinition | null {
        return this.systemManager.getFactionData(factionId);
    }

    public sortRoleDefinitions(roles: RoleDefinition[]): RoleDefinition[] {
        return this.systemManager.sortRoleDefinitions(roles);
    }
}
