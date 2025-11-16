import { system } from "@minecraft/server";
import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import type { RoleManager } from "./RoleManager";
import { SCRIPT_EVENT_COMMAND_IDS, SCRIPT_EVENT_ID_SUFFIX } from "../../../constants/scriptevent";
import { SCRIPT_EVENT_ID_PREFIX } from "../../../../Kairo/constants/scriptevent";

export class RoleRegistrationRequester {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleRegistrationRequester {
        return new RoleRegistrationRequester(roleManager);
    }

    public requestRoleRegistration(): void {
        ConsoleManager.log("Requesting role registration...");
        system.sendScriptEvent(
            `${SCRIPT_EVENT_ID_PREFIX.KAIRO}:${SCRIPT_EVENT_ID_SUFFIX.BROADCAST}`,
            SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_REQUEST,
        );
    }
}
