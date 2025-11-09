import { EventManager } from "./events/EventManager";
import { GameManager } from "./ingame/GameManager";
import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegister } from "./outgame/RoleRegister";
import { ScriptEventReceiver } from "./ScriptEventReceiver";
export class SystemManager {
    constructor() {
        this._gameManagerInst = null;
        this.roles = new Map();
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.roleRegistrationReceiver = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
        this.eventManager = EventManager.create(this);
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
        this.eventManager.subscribeAll();
    }
    unsubscribeEvents() {
        this.eventManager.unsubscribeAll();
    }
    async gameStart() {
        this._gameManagerInst = GameManager.create();
        await this._gameManagerInst.gameStart();
        if (this._gameManagerInst !== null)
            this._gameManagerInst = null;
    }
    gameReset() {
        if (this._gameManagerInst === null)
            return;
        this._gameManagerInst.gameReset();
    }
}
SystemManager.instance = null;
