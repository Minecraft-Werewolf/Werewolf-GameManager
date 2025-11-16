import { system } from "@minecraft/server";
import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import { SCRIPT_EVENT_COMMAND_IDS, SCRIPT_EVENT_ID_SUFFIX } from "../../../constants/scriptevent";
import { SCRIPT_EVENT_ID_PREFIX } from "../../../../Kairo/constants/scriptevent";
import { properties } from "../../../../properties";
export class RoleRegistrationRequester {
    constructor(roleManager) {
        this.roleManager = roleManager;
    }
    static create(roleManager) {
        return new RoleRegistrationRequester(roleManager);
    }
    request() {
        const data = {
            commandId: SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_REQUEST,
            addonId: properties.id,
        };
        ConsoleManager.log("Requesting role registration...");
        system.sendScriptEvent(`${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${SCRIPT_EVENT_ID_SUFFIX.BROADCAST}`, JSON.stringify(data));
    }
}
