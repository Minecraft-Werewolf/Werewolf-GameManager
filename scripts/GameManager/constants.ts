import { TicksPerSecond } from "@minecraft/server"

export const SCRIPT_EVENT_COMMAND_IDS = {
    ROLE_REGISTRATION: "role_registration",
}

export const SYSTEMS = {
    INTERVAL_EVERY_TICK: 1,
    
    // https://learn.microsoft.com/ja-jp/minecraft/creator/scriptapi/minecraft/server/minecraft-server?view=minecraft-bedrock-stable#tickspersecond
    INTERVAL_EVERY_SECOND: TicksPerSecond,
}