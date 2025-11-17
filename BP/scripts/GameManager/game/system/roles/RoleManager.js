import { RoleDataValidator } from "./RoleDataValidator";
import { RoleRegister } from "./RoleRegister";
import { RoleRegistrationRequester } from "./RoleRegistrationRequester";
export class RoleManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.roles = new Map();
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
        this.roles.set(addonId, roles);
        console.log(JSON.stringify(this.roles.get("werewolf-standardroles")));
    }
    requestRoleRegistration() {
        this.roleRegistrationRequester.request();
    }
    getRegisteredRoles() {
        return this.roles;
    }
}
