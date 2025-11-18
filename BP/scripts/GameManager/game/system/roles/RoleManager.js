import { RoleDataValidator } from "./RoleDataValidator";
import { RoleRegister } from "./RoleRegister";
import { RoleRegistrationRequester } from "./RoleRegistrationRequester";
export class RoleManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.registeredRoleDefinitions = new Map();
        this.selectedRolesForNextGame = [];
        this.roleDataValidator = RoleDataValidator.create(this);
        this.roleRegister = RoleRegister.create(this);
        this.roleRegistrationRequester = RoleRegistrationRequester.create(this);
    }
    static create(systemManager) {
        return new RoleManager(systemManager);
    }
    registerRoles(addonId, roles) {
        this.roleRegister.registerRoles(addonId, roles);
    }
    isRole(data) {
        return this.roleDataValidator.isRole(data);
    }
    setRoles(addonId, roles) {
        this.registeredRoleDefinitions.set(addonId, roles);
    }
    requestRoleRegistration() {
        this.roleRegistrationRequester.request();
    }
    getRegisteredRoleDefinitions() {
        return this.registeredRoleDefinitions;
    }
    getSelectedRolesForNextGame() {
        return this.selectedRolesForNextGame;
    }
}
