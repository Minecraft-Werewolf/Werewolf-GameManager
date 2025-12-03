import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { KairoUtils, type KairoCommand } from "../../../../Kairo/utils/KairoUtils";
import { properties } from "../../../../properties";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../../constants/systems";
import type { FactionManager } from "./FactionManager";

export class FactionReRegistrationRequester {
    private constructor(private readonly factionManager: FactionManager) {}
    public static create(factionManager: FactionManager): FactionReRegistrationRequester {
        return new FactionReRegistrationRequester(factionManager);
    }

    public request(): void {
        const data: KairoCommand = {
            commandId: SCRIPT_EVENT_COMMAND_IDS.FACTION_RE_REGISTRATION_REQUEST,
            addonId: properties.id,
        };

        ConsoleManager.log("Requesting faction re_registration...");
        KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.BROADCAST, data);
    }
}
