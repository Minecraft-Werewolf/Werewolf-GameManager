import { EventManager } from "./events/EventManager";
import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegister } from "./outgame/RoleRegister";
import { ScriptEventReceiver } from "./ScriptEventReceiver";
import { GameInitializer } from "./ingame/init/GameInitializer";
import { GamePreparationManager } from "./ingame/GamePreparationManager";
import { GameManager } from "./ingame/GameManager";
export class SystemManager {
    constructor() {
        this.roles = new Map();
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.roleRegistrationReceiver = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
        this.eventManager = EventManager.create(this);
        this.gameInitializer = GameInitializer.create(this);
        this.gamePreparationManager = GamePreparationManager.create(this);
        this.gameManager = GameManager
            .create(this);
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
    gameInitialization() {
        this.gameInitializer.runInitializationAsync();
    }
    gamePreparation() {
        this.gamePreparationManager.runPreparationAsync();
    }
}
SystemManager.instance = null;
