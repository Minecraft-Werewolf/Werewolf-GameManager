import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { KairoUtils } from "../../../../Kairo/utils/KairoUtils";
import { properties } from "../../../../properties";
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
        const data = {
            commandId: SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_NOTIFY,
            addonId: properties.id,
            registered: validatedRolesIds,
        };
        ConsoleManager.log(`Role Registration Successfully: "${validateResult.addonId}" { ${validatedRolesIds.join(", ")} }`);
        KairoUtils.sendKairoCommand(validateResult.addonId, data);
    }
}
