import type { DefinitionManager } from "../DefinitionManager";

export class RoleGroupDefinitionManager {
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager) {
        return new RoleGroupDefinitionManager(definitionManager);
    }

    public registerRoleGroupDefinitions(roleGroups: unknown[]) {}
}
