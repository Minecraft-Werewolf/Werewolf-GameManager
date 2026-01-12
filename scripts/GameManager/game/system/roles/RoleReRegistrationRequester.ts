import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import type { RoleManager } from "./RoleManager";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../../constants/systems";

export class RoleReRegistrationRequester {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleReRegistrationRequester {
        return new RoleReRegistrationRequester(roleManager);
    }

    public request(): void {
        ConsoleManager.log("Requesting role re_registration...");
        KairoUtils.sendKairoCommand(
            KAIRO_COMMAND_TARGET_ADDON_IDS.BROADCAST,
            SCRIPT_EVENT_COMMAND_IDS.ROLE_RE_REGISTRATION_REQUEST,
        );
    }
}
