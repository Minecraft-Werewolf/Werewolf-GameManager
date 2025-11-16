import { RoleSettingManager } from "./RoleSettingManager";
import { ActionFormData } from "@minecraft/server-ui";
export class GameSettingManager {
    constructor(outGameManager) {
        this.outGameManager = outGameManager;
        this.roleSettingManager = RoleSettingManager.create(this);
    }
    static create(outGameManager) {
        return new GameSettingManager(outGameManager);
    }
    async openSettingsForm(player) { }
}
