import {
    KairoUtils,
    type KairoCommand,
    type KairoResponse,
} from "../../../../@core/kairo/utils/KairoUtils";
import type { OutGameManager } from "../OutGameManager";
import { DefinitionDataManager } from "./DefinitionDataManager";
import { FactionDefinitionManager } from "./factions/FactionDefinitionManager";
import { RegistrationResultNotifer } from "./RegistrationResultNotifer";
import { RoleGroupDefinitionManager } from "./rolegroups/RoleGroupDefinitionManager";
import { RoleDefinitionManager } from "./roles/RoleDefinitionManager";
import { SettingDefinitionManager } from "./settings/SettingDefinitionManager";

export const definitionTypeValues = ["role", "faction", "roleGroup", "setting"] as const;
export type DefinitionType = (typeof definitionTypeValues)[number];

export class DefinitionManager {
    private readonly definitionDataManager = DefinitionDataManager.create(this);
    private readonly registrationResultNotifer = RegistrationResultNotifer.create(this);
    private readonly roleDefinitionManager = RoleDefinitionManager.create(this);
    private readonly factionDefinitionManager = FactionDefinitionManager.create(this);
    private readonly roleGroupDefinitionManager = RoleGroupDefinitionManager.create(this);
    private readonly settingDefinitionManager = SettingDefinitionManager.create(this);
    private constructor(private readonly outGameManager: OutGameManager) {}
    public static create(outGameManager: OutGameManager): DefinitionManager {
        return new DefinitionManager(outGameManager);
    }

    public async requestRegistrationDefinitions(command: KairoCommand): Promise<KairoResponse> {
        const definitionType: DefinitionType = command.data.definitionType;
        if (definitionType === undefined || !definitionTypeValues.includes(definitionType)) {
            return KairoUtils.buildKairoResponse({}, false);
        }

        const definitions: unknown[] = command.data.definitions;

        switch (definitionType) {
            case "role":
                return this.roleDefinitionManager.registerRoleDefinitions(
                    command.sourceAddonId,
                    definitions,
                );

            case "faction":
                return this.factionDefinitionManager.registerFactionDefinitions(
                    command.sourceAddonId,
                    definitions,
                );
            case "roleGroup":
                return this.roleGroupDefinitionManager.registerRoleGroupDefinitions(
                    command.sourceAddonId,
                    definitions,
                );
            case "setting":
                return this.settingDefinitionManager.registerSettingDefinitions(
                    command.sourceAddonId,
                    definitions,
                );
            default:
                return KairoUtils.buildKairoResponse({}, false);
        }
    }

    public notifiyRegistrationResult(
        isSuccessful: boolean,
        type: DefinitionType,
        addonId: string,
        definitionIds: string[],
    ) {
        this.registrationResultNotifer.notifiy(isSuccessful, type, addonId, definitionIds);
    }

    public saveDefinitionsToDataVault(
        addonId: string,
        definitionsJSON: string,
        addonListSaveKey: string,
        definitionSaveKeyPrefix: string,
    ) {
        return this.definitionDataManager.saveDefinitionsToDataVault(
            addonId,
            definitionsJSON,
            addonListSaveKey,
            definitionSaveKeyPrefix,
        );
    }

    public getDefinitions<T>(
        addonListSaveKey: string,
        definitionSaveKeyPrefix: string,
    ): Promise<T[]> {
        return this.definitionDataManager.getDefinitions<T>(
            addonListSaveKey,
            definitionSaveKeyPrefix,
        );
    }

    public getDefinitionsMap<T>(
        addonListSaveKey: string,
        definitionSaveKeyPrefix: string,
    ): Promise<Map<string, T[]>> {
        return this.definitionDataManager.getDefinitionsMap<T>(
            addonListSaveKey,
            definitionSaveKeyPrefix,
        );
    }
}
