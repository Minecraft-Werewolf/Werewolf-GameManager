import type { KairoResponse } from "../../../../../@core/kairo/utils/KairoUtils";
import type { DefinitionManager } from "../DefinitionManager";

export class SettingDefinitionManager {
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager) {
        return new SettingDefinitionManager(definitionManager);
    }

    public async registerSettingDefinitions(
        addonId: string,
        roles: unknown[],
    ): Promise<KairoResponse> {}
}
