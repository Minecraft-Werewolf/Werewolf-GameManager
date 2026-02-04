import { KairoUtils } from "../../../../@core/kairo/utils/KairoUtils";
import type { DefinitionManager } from "./DefinitionManager";

export class DefinitionDataManager {
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager) {
        return new DefinitionDataManager(definitionManager);
    }

    public async saveDefinitionsToDataVault(
        addonId: string,
        definitionsJSON: string,
        addonListSaveKey: string,
        definitionSaveKeyPrefix: string,
    ): Promise<void> {
        const loaded = await KairoUtils.loadFromDataVault(addonListSaveKey);
        const savedAddonIds: string[] = typeof loaded === "string" ? JSON.parse(loaded) : [];

        if (!savedAddonIds.includes(addonId)) {
            savedAddonIds.push(addonId);
            await KairoUtils.saveToDataVault(addonListSaveKey, JSON.stringify(savedAddonIds));
        }

        await KairoUtils.saveToDataVault(
            definitionSaveKeyPrefix + addonId,
            JSON.stringify(definitionsJSON),
        );
    }

    public async getDefinitions<T>(
        addonListSaveKey: string,
        definitionSaveKeyPrefix: string,
    ): Promise<T[]> {
        const loaded = await KairoUtils.loadFromDataVault(addonListSaveKey);
        const savedAddonIds: string[] = typeof loaded === "string" ? JSON.parse(loaded) : [];

        const definitions = await Promise.all(
            savedAddonIds.map((addonId) =>
                this.loadDefinitionsByAddonId<T>(addonId, definitionSaveKeyPrefix),
            ),
        );

        return definitions.flat();
    }

    public async getDefinitionsMap<T>(
        addonListSaveKey: string,
        definitionSaveKeyPrefix: string,
    ): Promise<Map<string, T[]>> {
        const loaded = await KairoUtils.loadFromDataVault(addonListSaveKey);
        const savedAddonIds: string[] = typeof loaded === "string" ? JSON.parse(loaded) : [];

        const entries = await Promise.all(
            savedAddonIds.map(async (addonId) => {
                const defs = await this.loadDefinitionsByAddonId<T>(
                    addonId,
                    definitionSaveKeyPrefix,
                );
                return [addonId, defs] as const;
            }),
        );

        return new Map(entries);
    }

    private async loadDefinitionsByAddonId<T>(
        addonId: string,
        definitionSaveKeyPrefix: string,
    ): Promise<T[]> {
        const loaded = await KairoUtils.loadFromDataVault(definitionSaveKeyPrefix + addonId);
        return typeof loaded === "string" ? (JSON.parse(loaded) as T[]) : [];
    }
}
