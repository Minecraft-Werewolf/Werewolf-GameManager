import type { RoleDefinition } from "../../../data/roles";
import type { RoleManager } from "./RoleManager";

export class RoleDefinitionSorter {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleDefinitionSorter {
        return new RoleDefinitionSorter(roleManager);
    }

    public sort(roles: RoleDefinition[]): RoleDefinition[] {
        return roles.sort((a, b) => this.compare(a, b));
    }

    public compare(a: RoleDefinition, b: RoleDefinition): number {
        // 1. 陣営順
        const aFaction = this.roleManager.getFactionData(a.factionId);
        const bFaction = this.roleManager.getFactionData(b.factionId);

        if (aFaction === null && bFaction !== null) return 1;
        if (aFaction !== null && bFaction === null) return -1;
        if (aFaction !== null && bFaction !== null) {
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
}
