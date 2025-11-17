import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../constants/translate";
export class RoleAssignmentManager {
    constructor(gameSettingManager) {
        this.gameSettingManager = gameSettingManager;
    }
    static create(gameSettingManager) {
        return new RoleAssignmentManager(gameSettingManager);
    }
    async open(playerId) {
        const player = world.getPlayers().find((p) => p.id === playerId);
        if (player === undefined) {
            ConsoleManager.error("[RoleAssignmentManager] Player not Found");
            return;
        }
        const roles = this.gameSettingManager.getRegisteredRoles();
        const addonIds = Array.from(roles.keys()).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
        const form = new ActionFormData()
            .title({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_ASSIGNMENT_TITLE })
            .body("役職リスト")
            .button({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_ASSIGNMENT_CONFIRM,
        })
            .divider();
        for (const addonId of addonIds) {
            form.button({ translate: `${addonId}.name` });
        }
        const { selection, canceled, cancelationReason } = await form.show(player);
    }
}
