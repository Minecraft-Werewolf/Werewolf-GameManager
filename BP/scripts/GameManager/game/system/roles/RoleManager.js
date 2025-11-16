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
    registerRoles(args) {
        this.roleRegister.registerRoles(args);
    }
    isRole(data) {
        return this.roleDataValidator.isRole(data);
    }
    setRoles(addonId, roles) {
        this.roles.set(addonId, roles);
    }
}
