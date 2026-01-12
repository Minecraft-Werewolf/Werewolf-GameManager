import { FactionDataValidator } from "./FactionDataValidator";
import { FactionRegistrationNotifier } from "./FactionRegistrationNotifier";
import { FactionRegistrationValidator, } from "./FactionRegistrationValidator.ts";
import { FactionReRegistrationRequester } from "./FactionReRegistrationRequester.ts";
export class FactionManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.registeredFactionDefinitions = new Map();
        this.selectedFactionsForNextGame = [];
        this.factionDataValidator = FactionDataValidator.create(this);
        this.factionRegistrationNotifier = FactionRegistrationNotifier.create(this);
        this.factionRegistrationValidator = FactionRegistrationValidator.create(this);
        this.factionReRegistrationRequester = FactionReRegistrationRequester.create(this);
    }
    static create(systemManager) {
        return new FactionManager(systemManager);
    }
    registerFactions(addonId, factions) {
        const validateResult = this.factionRegistrationValidator.validateFactionRegistration(addonId, factions);
        this.factionRegistrationNotifier.notify(validateResult);
        if (!validateResult.isSuccessful)
            return;
        this.setFactions(addonId, validateResult.validatedFactions);
        // 陣営定義は、id の重複がない場合は自動的に全部選択肢ちゃう
        // 今はテスト用に適当にツッコんじゃう
        this.selectedFactionsForNextGame.push(...validateResult.validatedFactions);
    }
    setFactions(addonId, factions) {
        this.registeredFactionDefinitions.set(addonId, factions);
    }
    clearFactions() {
        this.registeredFactionDefinitions.clear();
    }
    isFaction(data) {
        return this.factionDataValidator.isFaction(data);
    }
    requestFactionReRegistration() {
        this.clearFactions();
        this.factionReRegistrationRequester.request();
    }
    getRegisteredRoleDefinitions() {
        return this.registeredFactionDefinitions;
    }
    getSelectedRolesForNextGame() {
        return this.selectedFactionsForNextGame;
    }
    getFactionData(factionId) {
        const factionDef = this.selectedFactionsForNextGame.find((faction) => faction.id === factionId);
        if (factionDef === undefined)
            return null;
        return factionDef;
    }
}
