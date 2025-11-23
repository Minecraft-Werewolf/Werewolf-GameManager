import { ROOT_SETTINGS } from "../../../data/settings";
import { RoleAssignmentManager } from "./RoleAssignmentManager";
import { SettingTreeManager } from "./SettingTreeManager";
import { SettingUIManager } from "./SettingUIManager";
export class GameSettingManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.roleAssignmentManager = RoleAssignmentManager.create(this);
        this.settingTreeManager = SettingTreeManager.create(this);
        this.settingUIManager = SettingUIManager.create(this);
        this.rootSettingCategory = ROOT_SETTINGS;
    }
    static create(systemManager) {
        return new GameSettingManager(systemManager);
    }
    async opneSettingsForm(player) {
        return this.settingUIManager.open(player);
    }
    async openFormRoleAssignment(playerId) {
        return this.roleAssignmentManager.open(playerId);
    }
    getRoot() {
        return this.rootSettingCategory;
    }
    getRegisteredRoleDefinitions() {
        return this.systemManager.getRegisteredRoleDefinitions();
    }
    getSelectedRolesForNextGame() {
        return this.systemManager.getSelectedRolesForNextGame();
    }
    getFactionData(factionId) {
        return this.systemManager.getFactionData(factionId);
    }
}
