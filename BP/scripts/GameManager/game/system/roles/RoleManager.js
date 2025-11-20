import { RoleDataValidator } from "./RoleDataValidator";
import { RoleRegistrationValidator, } from "./RoleRegistratonValidator.ts";
import { RoleRegistrationNotifier } from "./RoleRegistrationNotifier";
import { RoleReRegistrationRequester } from "./RoleReRegistrationRequester";
export class RoleManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.registeredRoleDefinitions = new Map();
        this.selectedRolesForNextGame = [];
        this.roleDataValidator = RoleDataValidator.create(this);
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
        return this.selectedRolesForNextGame;
    }
}
