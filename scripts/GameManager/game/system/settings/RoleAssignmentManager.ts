import type { Player } from "@minecraft/server";
import type { GameSettingManager } from "./GameSettingManager";
import { ActionFormData } from "@minecraft/server-ui";

export class RoleAssignmentManager {
    private constructor(private readonly gameSettingManager: GameSettingManager) {}
    public static create(gameSettingManager: GameSettingManager): RoleAssignmentManager {
        return new RoleAssignmentManager(gameSettingManager);
    }

    public async openRoleSettingsForm(player: Player): Promise<void> {
        const form = new ActionFormData()
            .title("役職設定")
            .body("ここで役職の設定を行います。")
            .button("すたんだーどろーるず");
        const { selection, canceled, cancelationReason } = await form.show(player);
        if (canceled) return;
    }
}
