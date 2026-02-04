import type { DefinitionManager } from "../DefinitionManager";

export class SettingDefinitionManager {
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager) {
        return new SettingDefinitionManager(definitionManager);
    }

    public registerSettingDefinitions(roles: unknown[]) {}
}
