import { IntervalManager } from "./ingame/interval/IntervalManager";
import { EventManager } from "./events/EventManager";
import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegister } from "./outgame/RoleRegister";
import { ScriptEventReceiver } from "./ScriptEventReceiver";
import { GameInitializer } from "./ingame/init/GameInitializer";
import { GamePreparationManager } from "./ingame/GamePreparationManager";
export class WerewolfGameManager {
    constructor() {
        this.roles = new Map();
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.roleRegistrationReceiver = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
        this.intervalManager = IntervalManager.create(this);
        this.eventManager = EventManager.create(this);
        this.gameInitializer = GameInitializer.create(this);
        this.gamePreparationManager = GamePreparationManager.create(this);
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
    getIntervalManager() {
        return this.intervalManager;
    }
}
WerewolfGameManager.instance = null;
