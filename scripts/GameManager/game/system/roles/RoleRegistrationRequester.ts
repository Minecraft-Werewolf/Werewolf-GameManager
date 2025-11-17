import { system } from "@minecraft/server";
import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import type { RoleManager } from "./RoleManager";
import { SCRIPT_EVENT_COMMAND_IDS, SCRIPT_EVENT_ID_SUFFIX } from "../../../constants/scriptevent";
import { SCRIPT_EVENT_ID_PREFIX } from "../../../../Kairo/constants/scriptevent";
import { properties } from "../../../../properties";
import { KairoUtils, type KairoCommand } from "../../../../Kairo/utils/KairoUtils";

export class RoleRegistrationRequester {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleRegistrationRequester {
        return new RoleRegistrationRequester(roleManager);
    }

    public request(): void {
        const data: KairoCommand = {
            commandId: SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_REQUEST,
            addonId: properties.id,
        };

        ConsoleManager.log("Requesting role registration...");
        KairoUtils.sendKairoCommand(SCRIPT_EVENT_ID_SUFFIX.BROADCAST, data);
    }
}
