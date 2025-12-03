import { RoleDataValidator } from "./RoleDataValidator";
import { RoleRegistrationValidator, } from "./RoleRegistratonValidator.ts";
import { RoleRegistrationNotifier } from "./RoleRegistrationNotifier";
import { RoleReRegistrationRequester } from "./RoleReRegistrationRequester";
import { RoleDefinitionSorter } from "./RoleDefinitionSorter";
export class RoleManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.registeredRoleDefinitions = new Map();
        this.roleDataValidator = RoleDataValidator.create(this);
        this.roleDefinitionSorter = RoleDefinitionSorter.create(this);
        this.roleRegistrationValidator = RoleRegistrationValidator.create(this);
        this.roleRegistrationNotifier = RoleRegistrationNotifier.create(this);
        this.roleReRegistrationRequester = RoleReRegistrationRequester.create(this);
    }
    static create(systemManager) {
        return new RoleManager(systemManager);
    }
    registerRoles(addonId, roles) {
        const validateResult = this.roleRegistrationValidator.validateRoleRegistration(addonId, roles);
        this.roleRegistrationNotifier.notify(validateResult);
        if (!validateResult.isSuccessful)
            return;
        this.setRoles(addonId, validateResult.validatedRoles);
    }
    setRoles(addonId, roles) {
        this.registeredRoleDefinitions.set(addonId, roles);
    }
    clearRoles() {
        this.registeredRoleDefinitions.clear();
    }
    isRole(data) {
        return this.roleDataValidator.isRole(data);
    }
    requestRoleReRegistration() {
        this.clearRoles();
        this.roleReRegistrationRequester.request();
    }
    getRegisteredRoleDefinitions() {
        return this.registeredRoleDefinitions;
    }
    getSelectedRolesForNextGame() {
        return [...this.registeredRoleDefinitions.values()]
            .flat()
            .filter((role) => (role.count?.amount ?? 0) > 0);
    }
    getFactionData(factionId) {
        return this.systemManager.getFactionData(factionId);
    }
    sortRoleDefinitions(roles) {
        return this.roleDefinitionSorter.sort(roles);
    }
}
