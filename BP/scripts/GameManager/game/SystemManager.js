import { SystemEventManager } from "./events/SystemEventManager";
import { InGameManager } from "./ingame/InGameManager";
import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegister } from "./outgame/RoleRegister";
import { ScriptEventReceiver } from "./ScriptEventReceiver";
export class SystemManager {
    constructor() {
        this._inGameManagerInst = null;
        this.roles = new Map();
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.roleRegistrationReceiver = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
        this.systemEventManager = SystemEventManager.create(this);
    }
    static getInstance() {
        if (this.instance === null) {
            this.instance = new SystemManager();
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
    subscribeEvents() {
        this.systemEventManager.subscribeAll();
    }
    unsubscribeEvents() {
        this.systemEventManager.unsubscribeAll();
    }
    async gameStart() {
        this._inGameManagerInst = InGameManager.create();
        await this._inGameManagerInst.gameStart();
        if (this._inGameManagerInst !== null)
            this._inGameManagerInst = null;
    }
    gameReset() {
        if (this._inGameManagerInst === null)
            return;
        this._inGameManagerInst.gameReset();
    }
}
SystemManager.instance = null;
