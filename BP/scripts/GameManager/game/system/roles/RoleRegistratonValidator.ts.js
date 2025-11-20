export class RoleRegistrationValidator {
    constructor(roleManager) {
        this.roleManager = roleManager;
    }
    static create(roleManager) {
        return new RoleRegistrationValidator(roleManager);
    }
    validateRoleRegistration(addonId, roles) {
        if (!addonId || !Array.isArray(roles)) {
            return {
                addonId,
                isSuccessful: false,
                validatedRoles: [],
            };
        }
        const validatedRoles = roles
            .map((item) => {
            if (this.roleManager.isRole(item)) {
                const role = item;
                role.providerAddonId = addonId;
                return role;
            }
            return null;
        })
            .filter((role) => role !== null);
        return {
            addonId,
            isSuccessful: validatedRoles.length > 0,
            validatedRoles,
        };
    }
}
