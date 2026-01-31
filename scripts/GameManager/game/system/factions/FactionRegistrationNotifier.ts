import { ConsoleManager } from "../../../../@core/kairo/utils/ConsoleManager";
import { KairoUtils } from "../../../../@core/kairo/utils/KairoUtils";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import type { FactionManager } from "./FactionManager";
import type { ValidateFactionRegistrationResult } from "./FactionRegistrationValidator.ts";

export class FactionRegistrationNotifier {
    private constructor(private readonly factionManager: FactionManager) {}
    public static create(factionManager: FactionManager): FactionRegistrationNotifier {
        return new FactionRegistrationNotifier(factionManager);
    }

    public notify(validateResult: ValidateFactionRegistrationResult): void {
        const validatedFactionsIds = validateResult.validatedFactions.map((faction) => faction.id);

        if (validateResult.isSuccessful)
            ConsoleManager.log(
                `Faction registration succeeded from "${validateResult.addonId}": [ ${validatedFactionsIds.join(", ")} ]`,
            );
        else ConsoleManager.log(`Faction registration failed from "${validateResult.addonId}"`);
        KairoUtils.sendKairoCommand(
            validateResult.addonId,
            SCRIPT_EVENT_COMMAND_IDS.FACTION_REGISTRATION_NOTIFY,
            {
                registered: validatedFactionsIds,
            },
        );
    }
}
