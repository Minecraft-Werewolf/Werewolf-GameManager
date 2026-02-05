import type { FactionDefinition } from "../../../../data/factions";
import type { RoleDefinition } from "../../../../data/roles";
import type { RoleDefinitionManager } from "./RoleDefinitionManager";

export class RoleDefinitionComparator {
    private constructor(private readonly roleDefinitionManager: RoleDefinitionManager) {}

    public static create(roleDefinitionManager: RoleDefinitionManager): RoleDefinitionComparator {
        return new RoleDefinitionComparator(roleDefinitionManager);
    }

    public compare(a: RoleDefinition, b: RoleDefinition, factions: FactionDefinition[]): number {
        // 1. 陣営順
        const aFaction = factions.find((faction) => faction.id === a.factionId);
        const bFaction = factions.find((faction) => faction.id === b.factionId);

        if (aFaction === undefined && bFaction !== undefined) return 1;
        if (aFaction !== undefined && bFaction === undefined) return -1;
        if (aFaction !== undefined && bFaction !== undefined) {
            const diff = aFaction.sortIndex - bFaction.sortIndex;
            if (diff !== 0) return diff;
        }

        // 2. 狂人・非狂人
        const aIsMad = a.isExcludedFromSurvivalCheck === true ? 1 : 0;
        const bIsMad = b.isExcludedFromSurvivalCheck === true ? 1 : 0;
        if (aIsMad !== bIsMad) return aIsMad - bIsMad;

        // 3. addonId
        const addonCompare = a.providerAddonId.localeCompare(b.providerAddonId, "en", {
            numeric: true,
        });
        if (addonCompare !== 0) return addonCompare;

        // 4. sortIndex
        return a.sortIndex - b.sortIndex;
    }
    public sort(roles: RoleDefinition[], factions: FactionDefinition[]): RoleDefinition[] {
        return roles.sort((a, b) => this.compare(a, b, factions));
    }
}
