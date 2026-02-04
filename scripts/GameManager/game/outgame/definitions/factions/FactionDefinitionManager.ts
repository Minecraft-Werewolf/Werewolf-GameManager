import type { KairoResponse } from "../../../../../@core/kairo/utils/KairoUtils";
import type { DefinitionManager } from "../DefinitionManager";

export class FactionDefinitionManager {
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager) {
        return new FactionDefinitionManager(definitionManager);
    }

    public async registerFactionDefinitions(
        addonId: string,
        roles: unknown[],
    ): Promise<KairoResponse> {}
}
