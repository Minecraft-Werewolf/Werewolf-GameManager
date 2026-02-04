import type { DefinitionManager } from "../DefinitionManager";

export class RoleDefinitionManager {
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager) {
        return new RoleDefinitionManager(definitionManager);
    }

    public registerRoleDefinitions(roles: unknown[]) {}
}
