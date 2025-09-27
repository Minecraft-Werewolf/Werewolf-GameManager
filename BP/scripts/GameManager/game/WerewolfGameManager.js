import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegister } from "./outgame/RoleRegister";
import { ScriptEventReceiver } from "./ScriptEventReceiver";
export class WerewolfGameManager {
    constructor() {
        this.roles = new Map();
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.roleRegistrationReceiver = RoleRegister.create(this);
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
    handleOnScriptEvent(message) {
        this.scriptEventReceiver.handleOnScriptEvent(message);
    }
}
WerewolfGameManager.instance = null;
