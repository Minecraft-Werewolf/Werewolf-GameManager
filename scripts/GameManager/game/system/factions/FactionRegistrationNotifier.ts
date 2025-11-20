import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { KairoUtils, type KairoCommand } from "../../../../Kairo/utils/KairoUtils";
import { properties } from "../../../../properties";
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

        const data: KairoCommand = {
            commandId: SCRIPT_EVENT_COMMAND_IDS.FACTION_REGISTRATION_NOTIFY,
            addonId: properties.id,
            registered: validatedFactionsIds,
        };

        ConsoleManager.log(
            `Faction Registration Successfully: "${validateResult.addonId}" { ${validatedFactionsIds.join(", ")} }`,
        );
        KairoUtils.sendKairoCommand(validateResult.addonId, data);
    }
}
