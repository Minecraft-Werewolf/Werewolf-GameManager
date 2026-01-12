import type { FactionDefinition } from "../../../data/factions";
import type { SystemManager } from "../../SystemManager";
import { FactionDataValidator } from "./FactionDataValidator";
import { FactionRegistrationNotifier } from "./FactionRegistrationNotifier";
import {
    FactionRegistrationValidator,
    type ValidateFactionRegistrationResult,
} from "./FactionRegistrationValidator.ts";
import { FactionReRegistrationRequester } from "./FactionReRegistrationRequester.ts";

export class FactionManager {
    private readonly factionDataValidator: FactionDataValidator;
    private readonly factionRegistrationNotifier: FactionRegistrationNotifier;
    private readonly factionRegistrationValidator: FactionRegistrationValidator;
    private readonly factionReRegistrationRequester: FactionReRegistrationRequester;

    private readonly registeredFactionDefinitions: Map<string, FactionDefinition[]> = new Map();
    private readonly selectedFactionsForNextGame: FactionDefinition[] = [];

    private constructor(private readonly systemManager: SystemManager) {
        this.factionDataValidator = FactionDataValidator.create(this);
        this.factionRegistrationNotifier = FactionRegistrationNotifier.create(this);
        this.factionRegistrationValidator = FactionRegistrationValidator.create(this);
        this.factionReRegistrationRequester = FactionReRegistrationRequester.create(this);
    }
    public static create(systemManager: SystemManager): FactionManager {
        return new FactionManager(systemManager);
    }

    public registerFactions(addonId: string, factions: unknown[]) {
        const validateResult: ValidateFactionRegistrationResult =
            this.factionRegistrationValidator.validateFactionRegistration(addonId, factions);

        this.factionRegistrationNotifier.notify(validateResult);

        if (!validateResult.isSuccessful) return;

        this.setFactions(addonId, validateResult.validatedFactions);

        // 陣営定義は、id の重複がない場合は自動的に全部選択肢ちゃう
        // 今はテスト用に適当にツッコんじゃう
        this.selectedFactionsForNextGame.push(...validateResult.validatedFactions);
    }

    public setFactions(addonId: string, factions: FactionDefinition[]): void {
        this.registeredFactionDefinitions.set(addonId, factions);
    }

    public clearFactions(): void {
        this.registeredFactionDefinitions.clear();
    }

    public isFaction(data: unknown): boolean {
        return this.factionDataValidator.isFaction(data);
    }

    public requestFactionReRegistration(): void {
        this.clearFactions();
        this.factionReRegistrationRequester.request();
    }

    public getRegisteredRoleDefinitions(): Map<string, FactionDefinition[]> {
        return this.registeredFactionDefinitions;
    }

    public getSelectedRolesForNextGame(): FactionDefinition[] {
        return this.selectedFactionsForNextGame;
    }

    public getFactionData(factionId: string): FactionDefinition | null {
        const factionDef = this.selectedFactionsForNextGame.find(
            (faction) => faction.id === factionId,
        );
        if (factionDef === undefined) return null;

        return factionDef;
    }
}
