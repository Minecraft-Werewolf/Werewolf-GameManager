import { system } from "@minecraft/server";
import { AddonReceiver } from "./router/AddonReceiver";
export class AddonManager {
    constructor(kairo) {
        this.kairo = kairo;
        this._isActive = false;
        this.receiver = AddonReceiver.create(this);
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
    async _scriptEvent(data) {
        return this.kairo._scriptEvent(data);
    }
    get isActive() {
        return this._isActive;
    }
    setActiveState(state) {
        this._isActive = state;
    }
}
