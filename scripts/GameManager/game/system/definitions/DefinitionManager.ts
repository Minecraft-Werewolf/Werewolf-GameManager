import type { KairoCommand } from "../../../../@core/kairo/utils/KairoUtils";
import type { SystemManager } from "../../SystemManager";
import { FactionDefinitionManager } from "./factions/FactionDefinitionManager";
import { RoleGroupDefinitionManager } from "./rolegroups/RoleGroupDefinitionManager";
import { RoleDefinitionManager } from "./roles/RoleDefinitionManager";
import { SettingDefinitionManager } from "./settings/SettingDefinitionManager";

export const definitionTypeValues = ["role", "faction", "roleGroup", "setting"] as const;
export type DefinitionType = (typeof definitionTypeValues)[number];

export class DefinitionManager {
    private readonly roleDefinitionManager = RoleDefinitionManager.create(this);
    private readonly factionDefinitionManager = FactionDefinitionManager.create(this);
    private readonly roleGroupDefinitionManager = RoleGroupDefinitionManager.create(this);
    private readonly settingDefinitionManager = SettingDefinitionManager.create(this);
    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): DefinitionManager {
        return new DefinitionManager(systemManager);
    }

    public requestRegistrationDefinitions(command: KairoCommand) {
        const definitionType: DefinitionType = command.data.definitionType;
        if (definitionType === undefined) return;
        if (!definitionTypeValues.includes(definitionType)) return;

        const definitions: unknown[] = command.data.definitions;

        switch (definitionType) {
            case "role":
                this.roleDefinitionManager.registerRoleDefinitions(definitions);
                return;
            case "faction":
                this.factionDefinitionManager.registerFactionDefinitions(definitions);
                return;
            case "roleGroup":
                this.roleGroupDefinitionManager.registerRoleGroupDefinitions(definitions);
                return;
            case "setting":
                this.settingDefinitionManager.registerSettingDefinitions(definitions);
                return;
        }
    }
}
