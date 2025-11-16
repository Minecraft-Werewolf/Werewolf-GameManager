import { InGameManager } from "./ingame/InGameManager";
import { OutGameManager } from "./outgame/OutGameManager";
import { SystemEventManager } from "./system/events/SystemEventManager";
import { RoleManager } from "./system/roles/RoleManager";
import { ScriptEventReceiver } from "./system/ScriptEventReceiver";
import { WorldStateChangeBroadcaster } from "./system/WorldStateChangeBroadcaster";
import { WorldStateChanger } from "./system/WorldStateChanger";
export var GameWorldState;
(function (GameWorldState) {
    GameWorldState[GameWorldState["OutGame"] = 0] = "OutGame";
    GameWorldState[GameWorldState["InGame"] = 1] = "InGame";
})(GameWorldState || (GameWorldState = {}));
export class SystemManager {
    constructor() {
        this.inGameManager = null;
        this.outGameManager = null;
        this.currentWorldState = null;
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.systemEventManager = SystemEventManager.create(this);
        this.worldStateChanger = WorldStateChanger.create(this);
        this.worldStateChangeBroadcaster = WorldStateChangeBroadcaster.create(this);
        this.roleManager = RoleManager.create(this);
    }
    init() {
        this.changeWorldState(GameWorldState.OutGame);
        this.roleManager.requestRoleRegistration();
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
        this.worldStateChanger.change(nextState);
    }
    registerRoles(addonId, roles) {
        this.roleManager.registerRoles(addonId, roles);
    }
    getWorldState() {
        return this.currentWorldState;
    }
    setWorldState(state) {
        this.currentWorldState = state;
    }
    getInGameManager() {
        return this.inGameManager;
    }
    setInGameManager(v) {
        this.inGameManager = v;
    }
    getOutGameManager() {
        return this.outGameManager;
    }
    setOutGameManager(v) {
        this.outGameManager = v;
    }
    createInGameManager() {
        return InGameManager.create(this);
    }
    createOutGameManager() {
        return OutGameManager.create(this);
    }
    broadcastWorldStateChange(next) {
        this.worldStateChangeBroadcaster.broadcast(next);
    }
}
SystemManager.instance = null;
