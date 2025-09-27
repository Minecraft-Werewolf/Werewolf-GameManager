import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegistrationReceiver } from "./outgame/RoleRegistrationReceiver";
export class WerewolfGameManager {
    constructor() {
        this.roles = new Map();
        this.roleRegistrationReceiver = RoleRegistrationReceiver.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
    }
    static getInstance() {
        if (this.instance === null) {
            this.instance = new WerewolfGameManager();
        }
        return this.instance;
    }
    registrationRoles(args) {
        this.roleRegistrationReceiver.registrationRoles(args);
    }
    isRole(data) {
        return this.roleDataValidator.isRole(data);
    }
    setRoles(addonId, roles) {
        this.roles.set(addonId, roles);
    }
}
WerewolfGameManager.instance = null;
