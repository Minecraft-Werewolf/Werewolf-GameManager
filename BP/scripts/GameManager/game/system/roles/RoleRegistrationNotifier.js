import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../../constants/scriptevent";
export class RoleRegistrationNotifier {
    constructor(roleManager) {
        this.roleManager = roleManager;
    }
    static create(roleManager) {
        return new RoleRegistrationNotifier(roleManager);
    }
    notify(validateResult) {
        const validatedRolesIds = validateResult.validatedRoles.map((role) => role.id);
        if (validateResult.isSuccessful)
            ConsoleManager.log(`Role registration succeeded from "${validateResult.addonId}": [ ${validatedRolesIds.join(", ")} ]`);
        else
            ConsoleManager.log(`Role registration failed from "${validateResult.addonId}"`);
        KairoUtils.sendKairoCommand(validateResult.addonId, SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_NOTIFY, {
            registered: validatedRolesIds,
        });
    }
}
