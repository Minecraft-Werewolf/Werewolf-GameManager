import type { Player } from "@minecraft/server";
import { ROOT_SETTINGS, type SettingCategoryNode } from "../../../data/settings";
import type { SystemManager } from "../../SystemManager";
import { RoleAssignmentManager } from "./RoleAssignmentManager";
import { SettingTreeManager } from "./SettingTreeManager";
import { SettingUIManager } from "./SettingUIManager";
import type { Role } from "../../../data/roles";

export class GameSettingManager {
    private readonly roleAssignmentManager: RoleAssignmentManager;
    private readonly settingTreeManager: SettingTreeManager;
    private readonly settingUIManager: SettingUIManager;
    private readonly rootSettingCategory: SettingCategoryNode;

    private constructor(private readonly systemManager: SystemManager) {
        this.roleAssignmentManager = RoleAssignmentManager.create(this);
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

    public async openFormRoleAssignment(playerId: string): Promise<void> {
        return this.roleAssignmentManager.open(playerId);
    }

    public getRoot(): SettingCategoryNode {
        return this.rootSettingCategory;
    }

    public getRegisteredRoles(): Map<string, Role[]> {
        return this.systemManager.getRegisteredRoles();
    }
}
