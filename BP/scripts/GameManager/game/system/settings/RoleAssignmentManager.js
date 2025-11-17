import { ActionFormData } from "@minecraft/server-ui";
export class RoleAssignmentManager {
    constructor(gameSettingManager) {
        this.gameSettingManager = gameSettingManager;
    }
    static create(gameSettingManager) {
        return new RoleAssignmentManager(gameSettingManager);
    }
    async openRoleSettingsForm(player) {
        const form = new ActionFormData()
            .title("役職設定")
            .body("ここで役職の設定を行います。")
            .button("すたんだーどろーるず");
        const { selection, canceled, cancelationReason } = await form.show(player);
        if (canceled)
            return;
    }
}
