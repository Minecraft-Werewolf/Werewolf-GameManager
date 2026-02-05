export class RoleDefinitionManager {
    private readonly registeredDefinitionIds: Set<string> = new Set();

    private readonly roleDefinitionComparator = RoleDefinitionComparator.create(this);
    private readonly roleRegistrationValidator = RoleRegistrationValidator.create(this);
    private constructor(private readonly definitionManager: DefinitionManager) {}
    public static create(definitionManager: DefinitionManager): RoleDefinitionManager {
        return new RoleDefinitionManager(definitionManager);
    }

    private async saveDefinitionsToDataVault(
        addonId: string,
        definitions: RoleDefinition[],
    ): Promise<void> {
        return this.definitionManager.saveDefinitionsToDataVault(
            addonId,
            JSON.stringify(definitions),
            KAIRO_DATAVAULT_SAVE_KEYS.ROLE_DEFINITIONS_ADDON_LIST,
            KAIRO_DATAVAULT_SAVE_KEYS.ROLE_DEFINITIONS_PREFIX,
        );
    }

    public sortRoleDefinitions(
        roles: RoleDefinition[],
        factions: FactionDefinition[],
    ): RoleDefinition[] {
        return this.roleDefinitionComparator.sort(roles, factions);
    }

    public async getSelectedRoleDefinitions(): Promise<RoleDefinition[]> {
        const loaded = await KairoUtils.loadFromDataVault(
            KAIRO_DATAVAULT_SAVE_KEYS.ROLE_DEFINITIONS_ADDON_LIST,
        );
        const addonIds: string[] = typeof loaded === "string" ? JSON.parse(loaded) : [];

        const rolesByAddon = await Promise.all(
            addonIds.map(async (addonId) => {
                const loaded = await KairoUtils.loadFromDataVault(
                    KAIRO_DATAVAULT_SAVE_KEYS.ROLE_DEFINITIONS_PREFIX + addonId,
                );
                return typeof loaded === "string" ? (JSON.parse(loaded) as RoleDefinition[]) : [];
            }),
        );

        return rolesByAddon.flat().filter((role) => (role.count?.amount ?? 0) > 0);
    }
}
