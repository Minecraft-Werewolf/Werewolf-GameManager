import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
import type { RoleManager } from "./RoleManager";
import type { ValidateRoleRegistrationResult } from "./RoleRegistratonValidator.ts";

export class RoleRegistrationNotifier {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleRegistrationNotifier {
        return new RoleRegistrationNotifier(roleManager);
    }

    public notify(validateResult: ValidateRoleRegistrationResult): void {
        const validatedRolesIds = validateResult.validatedRoles.map((role) => role.id);

        if (validateResult.isSuccessful)
            ConsoleManager.log(
                `Role registration succeeded from "${validateResult.addonId}": [ ${validatedRolesIds.join(", ")} ]`,
            );
        else ConsoleManager.log(`Role registration failed from "${validateResult.addonId}"`);
        KairoUtils.sendKairoCommand(
            validateResult.addonId,
            SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_NOTIFY,
            {
                registered: validatedRolesIds,
            },
        );
    }
}
