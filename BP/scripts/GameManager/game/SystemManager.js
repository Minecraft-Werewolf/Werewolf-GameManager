import { InGameManager } from "./ingame/InGameManager";
import { OutGameManager } from "./outgame/OutGameManager";
import { SystemEventManager } from "./system/events/SystemEventManager";
import { RoleDataValidator } from "./system/roles/RoleDataValidator";
import { RoleRegister } from "./system/roles/RoleRegister";
import { ScriptEventReceiver } from "./system/ScriptEventReceiver";
export var GameWorldState;
(function (GameWorldState) {
    GameWorldState[GameWorldState["InGame"] = 0] = "InGame";
    GameWorldState[GameWorldState["OutGame"] = 1] = "OutGame";
})(GameWorldState || (GameWorldState = {}));
export class SystemManager {
    constructor() {
        this.inGameManager = null;
        this.outGameManager = null;
        this.currentWorldState = GameWorldState.OutGame;
        this.roles = new Map();
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.systemEventManager = SystemEventManager.create(this);
        this.roleRegister = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
        this.init();
    }
    init() {
        this.changeWorldState(GameWorldState.OutGame);
    }
    static getInstance() {
        if (this.instance === null) {
            this.instance = new SystemManager();
        }
        return this.instance;
    }
    handleScriptEvent(message) {
        this.scriptEventReceiver.handleScriptEvent(message);
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
    subscribeEvents() {
        this.systemEventManager.subscribeAll();
    }
    unsubscribeEvents() {
        this.systemEventManager.unsubscribeAll();
    }
    startGame() {
        if (this.currentWorldState !== GameWorldState.OutGame)
            return;
        this.changeWorldState(GameWorldState.InGame);
        this.inGameManager?.gameStart();
    }
    resetGame() {
        if (this.currentWorldState !== GameWorldState.InGame)
            return;
        this.inGameManager?.gameReset();
        this.changeWorldState(GameWorldState.OutGame);
    }
    changeWorldState(nextState) {
        if (this.currentWorldState === nextState)
            return;
        switch (nextState) {
            case GameWorldState.InGame:
                this.enterInGame();
                break;
            case GameWorldState.OutGame:
                this.enterOutGame();
                break;
        }
    }
    enterInGame() {
        this.outGameManager?.getOutGameEventManager().unsubscribeAll();
        this.outGameManager = null;
        this.inGameManager = InGameManager.create(this);
        this.inGameManager.getInGameEventManager().subscribeAll();
        this.currentWorldState = GameWorldState.InGame;
    }
    enterOutGame() {
        this.inGameManager?.getInGameEventManager().unsubscribeAll();
        this.inGameManager = null;
        this.outGameManager = OutGameManager.create(this);
        this.outGameManager.getOutGameEventManager().subscribeAll();
        this.currentWorldState = GameWorldState.OutGame;
    }
}
SystemManager.instance = null;
