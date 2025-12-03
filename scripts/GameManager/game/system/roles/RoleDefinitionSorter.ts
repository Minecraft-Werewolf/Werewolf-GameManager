import type { RoleDefinition } from "../../../data/roles";
import type { RoleManager } from "./RoleManager";

export class RoleDefinitionSorter {
    private constructor(private readonly RoleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleDefinitionSorter {
        return new RoleDefinitionSorter(roleManager);
    }

    public sort(roles: RoleDefinition[]): RoleDefinition[] {
        return roles.sort((a, b) => {
            // 1. 陣営順に並べる
            const aFaction = this.RoleManager.getFactionData(a.factionId);
            const bFaction = this.RoleManager.getFactionData(b.factionId);

            if (aFaction === null && bFaction !== null) return 1;
            if (aFaction !== null && bFaction === null) return -1;
            if (aFaction !== null && bFaction !== null) {
                return aFaction.sortIndex - bFaction.sortIndex;
            }
            // 両方nullの場合はスキップ

            // 2. 狂人・非狂人で並べる
            const aIsMad = a.isExcludedFromSurvivalCheck === true ? 1 : 0;
            const bIsMad = b.isExcludedFromSurvivalCheck === true ? 1 : 0;
            if (aIsMad !== bIsMad) return aIsMad - bIsMad;

            // 3. addonIdで並べる
            const addonCompare = a.providerAddonId.localeCompare(b.providerAddonId, "en", {
                numeric: true,
            });
            if (addonCompare !== 0) return addonCompare;

            // 4. sortIndexで並べる
            return a.sortIndex - b.sortIndex;
        });
    }
}
