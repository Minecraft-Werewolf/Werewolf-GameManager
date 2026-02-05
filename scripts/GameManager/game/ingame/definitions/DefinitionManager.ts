import type { FactionDefinition } from "../../../data/factions";
import type { RoleDefinition } from "../../../data/roles";
import type { InGameManager } from "../InGameManager";
import { DefinitionDataManager } from "./DefinitionDataManager";
import { RoleDefinitionManager } from "./RoleDefinitionManager";

export const definitionTypeValues = ["role", "faction", "roleGroup", "setting"] as const;
export type DefinitionType = (typeof definitionTypeValues)[number];

export class DefinitionManager {
    private readonly definitionDataManager = DefinitionDataManager.create(this);
    private readonly roleDefinitionManager = RoleDefinitionManager.create(this);
    private constructor(private readonly inGameManager: InGameManager) {}
    public static create(inGameManager: InGameManager): DefinitionManager {
        return new DefinitionManager(inGameManager);
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

    public sortRoleDefinitions(
        roles: RoleDefinition[],
        factions: FactionDefinition[],
    ): RoleDefinition[] {
        return this.roleDefinitionManager.sortRoleDefinitions(roles, factions);
    }

    public async getSelectedRoleDefinitions(): Promise<RoleDefinition[]> {
        return this.roleDefinitionManager.getSelectedRoleDefinitions();
    }
}
