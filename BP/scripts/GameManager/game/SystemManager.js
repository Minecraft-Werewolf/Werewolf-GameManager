import { world } from "@minecraft/server";
import { InGameManager } from "./ingame/InGameManager";
import { OutGameManager } from "./outgame/OutGameManager";
import { SystemEventManager } from "./system/events/SystemEventManager";
import { RoleManager } from "./system/roles/RoleManager";
import { ScriptEventReceiver } from "./system/ScriptEventReceiver";
import { WorldStateChangeBroadcaster } from "./system/WorldStateChangeBroadcaster";
import { WorldStateChanger } from "./system/WorldStateChanger";
import { GameSettingManager } from "./system/settings/GameSettingManager";
import { FactionManager } from "./system/factions/FactionManager";
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
        this.factionManager = FactionManager.create(this);
        this.roleManager = RoleManager.create(this);
        this.gameSettingManager = GameSettingManager.create(this);
    }
    // アドオン初期化時の処理
    init() {
        this.changeWorldState(GameWorldState.OutGame);
    }
    static getInstance() {
        if (this.instance === null) {
            this.instance = new SystemManager();
        }
        return this.instance;
    }
    async handleScriptEvent(data) {
        return this.scriptEventReceiver.handleScriptEvent(data);
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
    openSettingsForm(player) {
        this.gameSettingManager.opneSettingsForm(player);
    }
    openFormRoleComposition(playerId) {
        this.gameSettingManager.openFormRoleComposition(playerId);
    }
    getRegisteredRoleDefinitions() {
        return this.roleManager.getRegisteredRoleDefinitions();
    }
    getSelectedRolesForNextGame() {
        return this.roleManager.getSelectedRolesForNextGame();
    }
    registerFactions(addonId, factions) {
        this.factionManager.registerFactions(addonId, factions);
    }
    requestFactionReRegistration() {
        this.factionManager.requestFactionReRegistration();
    }
    registerRoles(addonId, roles) {
        this.roleManager.registerRoles(addonId, roles);
    }
    requestRoleReRegistration() {
        this.roleManager.requestRoleReRegistration();
    }
    sortRoleDefinitions(roles) {
        return this.roleManager.sortRoleDefinitions(roles);
    }
    getRoleComposition() {
        return this.roleManager.getSelectedRolesForNextGame();
    }
    getFactionData(factionId) {
        return this.factionManager.getFactionData(factionId);
    }
    getFactionDefinitions() {
        return this.factionManager.getSelectedRolesForNextGame();
    }
}
SystemManager.instance = null;
