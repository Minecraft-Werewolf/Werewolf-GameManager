import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../../constants/systems";
export class FactionReRegistrationRequester {
    constructor(factionManager) {
        this.factionManager = factionManager;
    }
    static create(factionManager) {
        return new FactionReRegistrationRequester(factionManager);
    }
    request() {
        ConsoleManager.log("Requesting faction re_registration...");
        KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.BROADCAST, SCRIPT_EVENT_COMMAND_IDS.FACTION_RE_REGISTRATION_REQUEST);
    }
}
