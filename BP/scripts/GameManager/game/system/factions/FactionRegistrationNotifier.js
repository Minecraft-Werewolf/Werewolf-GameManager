import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import { properties } from "../../../../properties";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
export class FactionRegistrationNotifier {
    constructor(factionManager) {
        this.factionManager = factionManager;
    }
    static create(factionManager) {
        return new FactionRegistrationNotifier(factionManager);
    }
    notify(validateResult) {
        const validatedFactionsIds = validateResult.validatedFactions.map((faction) => faction.id);
        const data = {
            commandId: SCRIPT_EVENT_COMMAND_IDS.FACTION_REGISTRATION_NOTIFY,
            addonId: properties.id,
            registered: validatedFactionsIds,
        };
        ConsoleManager.log(`Faction Registration Successfully: "${validateResult.addonId}" { ${validatedFactionsIds.join(", ")} }`);
        KairoUtils.sendKairoCommand(validateResult.addonId, data);
    }
}
