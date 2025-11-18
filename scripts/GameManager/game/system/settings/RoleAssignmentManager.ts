import { world } from "@minecraft/server";
import type { GameSettingManager } from "./GameSettingManager";
import { ActionFormData } from "@minecraft/server-ui";
import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import type { RoleDefinition } from "../../../data/roles";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../constants/translate";

export class RoleAssignmentManager {
    private constructor(private readonly gameSettingManager: GameSettingManager) {}
    public static create(gameSettingManager: GameSettingManager): RoleAssignmentManager {
        return new RoleAssignmentManager(gameSettingManager);
    }

    public async open(playerId: string): Promise<void> {
        const player = world.getPlayers().find((p) => p.id === playerId);
        if (player === undefined) {
            ConsoleManager.error("[RoleAssignmentManager] Player not Found");
            return;
        }

        const registeredRoleDefinitions: Map<string, RoleDefinition[]> =
            this.gameSettingManager.getRegisteredRoleDefinitions();
        const addonIds = Array.from(registeredRoleDefinitions.keys()).sort((a, b) =>
            a.localeCompare(b, "en", { numeric: true }),
        );

        const selectedRolesForNextGame: RoleDefinition[] =
            this.gameSettingManager.getSelectedRolesForNextGame();

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
