import { system } from "@minecraft/server";
import { AddonReceiver } from "./router/AddonReceiver";
import { DataVaultReceiver } from "./router/DataVaultReceiver";
export class AddonManager {
    constructor(kairo) {
        this.kairo = kairo;
        this._isActive = false;
        this.receiver = AddonReceiver.create(this);
        this.dataVaultReceiver = DataVaultReceiver.create(this);
    }
    static create(kairo) {
        return new AddonManager(kairo);
    }
    getSelfAddonProperty() {
        return this.kairo.getSelfAddonProperty();
    }
    subscribeReceiverHooks() {
        system.afterEvents.scriptEventReceive.subscribe(this.receiver.handleScriptEvent);
    }
    _activateAddon() {
        this.kairo._activateAddon();
    }
    _deactivateAddon() {
        this.kairo._deactivateAddon();
    }
    _scriptEvent(data) {
        this.kairo._scriptEvent(data);
    }
    dataVaultHandleOnScriptEvent(data) {
        this.dataVaultReceiver.handleOnScriptEvent(data);
    }
    getDataVaultLastDataLoaded() {
        return this.dataVaultReceiver.getLastDataLoaded();
    }
    get isActive() {
        return this._isActive;
    }
    setActiveState(state) {
        this._isActive = state;
    }
}
