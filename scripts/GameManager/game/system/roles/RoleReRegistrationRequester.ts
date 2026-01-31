import type { RoleManager } from "./RoleManager";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../../constants/systems";
import { ConsoleManager } from "../../../../@core/kairo/utils/ConsoleManager";
import { KairoUtils } from "../../../../@core/kairo/utils/KairoUtils";

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
