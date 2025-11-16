import { system } from "@minecraft/server";
import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { SCRIPT_EVENT_COMMAND_IDS, SCRIPT_EVENT_ID_SUFFIX } from "../../../constants/scriptevent";
import { SCRIPT_EVENT_ID_PREFIX } from "../../../../Kairo/constants/scriptevent";
export class RoleRegistrationRequester {
    constructor(roleManager) {
        this.roleManager = roleManager;
    }
    static create(roleManager) {
        return new RoleRegistrationRequester(roleManager);
    }
    requestRoleRegistration() {
        ConsoleManager.log("Requesting role registration...");
        system.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${SCRIPT_EVENT_ID_SUFFIX.BROADCAST}`, SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_REQUEST);
    }
}
