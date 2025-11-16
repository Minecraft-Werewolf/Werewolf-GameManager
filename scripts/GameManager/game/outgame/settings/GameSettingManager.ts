import type { Player } from "@minecraft/server";
import type { OutGameManager } from "../OutGameManager";
import { RoleSettingManager } from "./RoleSettingManager";
import { ActionFormData } from "@minecraft/server-ui";

export class GameSettingManager {
    private readonly roleSettingManager: RoleSettingManager;

    private constructor(private readonly outGameManager: OutGameManager) {
        this.roleSettingManager = RoleSettingManager.create(this);
    }
    public static create(outGameManager: OutGameManager): GameSettingManager {
        return new GameSettingManager(outGameManager);
    }

    public async openSettingsForm(player: Player): Promise<void> {}
}
