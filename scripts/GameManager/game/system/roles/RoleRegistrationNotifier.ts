import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { KairoUtils, type KairoCommand } from "../../../../Kairo/utils/KairoUtils";
import { properties } from "../../../../properties";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import type { RoleManager } from "./RoleManager";
import type { ValidateRegistrationResult } from "./RoleRegistratonValidator.ts";

export class RoleRegistrationNotifier {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleRegistrationNotifier {
        return new RoleRegistrationNotifier(roleManager);
    }

    public notify(validateResult: ValidateRegistrationResult): void {
        const registeredIds = validateResult.registered.map((role) => role.id);

        const data: KairoCommand = {
            commandId: SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_NOTIFY,
            addonId: properties.id,
            registered: registeredIds,
        };

        ConsoleManager.log(`Role Registration Successfully: ${registeredIds.join(", ")}`);
        KairoUtils.sendKairoCommand(validateResult.addonId, data);
    }
}
