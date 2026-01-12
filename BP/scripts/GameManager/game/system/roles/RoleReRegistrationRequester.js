import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../../constants/systems";
export class RoleReRegistrationRequester {
    constructor(roleManager) {
        this.roleManager = roleManager;
    }
    static create(roleManager) {
        return new RoleReRegistrationRequester(roleManager);
    }
    request() {
        ConsoleManager.log("Requesting role re_registration...");
        KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.BROADCAST, SCRIPT_EVENT_COMMAND_IDS.ROLE_RE_REGISTRATION_REQUEST);
    }
}
