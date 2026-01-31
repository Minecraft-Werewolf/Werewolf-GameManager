import { ConsoleManager } from "../../../../@core/kairo/utils/ConsoleManager";
import { KairoUtils } from "../../../../@core/kairo/utils/KairoUtils";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../../constants/systems";
import type { FactionManager } from "./FactionManager";

export class FactionReRegistrationRequester {
    private constructor(private readonly factionManager: FactionManager) {}
    public static create(factionManager: FactionManager): FactionReRegistrationRequester {
        return new FactionReRegistrationRequester(factionManager);
    }

    public request(): void {
        ConsoleManager.log("Requesting faction re_registration...");
        KairoUtils.sendKairoCommand(
            KAIRO_COMMAND_TARGET_ADDON_IDS.BROADCAST,
            SCRIPT_EVENT_COMMAND_IDS.FACTION_RE_REGISTRATION_REQUEST,
        );
    }
}
