import type { DefinitionManager } from "../DefinitionManager";

export class FactionDefinitionManager {
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager) {
        return new FactionDefinitionManager(definitionManager);
    }

    public registerFactionDefinitions(roles: unknown[]) {}
}
