import { TicksPerSecond } from "@minecraft/server"

export const SCRIPT_EVENT_IDS = {
    WEREWOLF_GAME_START: "GameManager:werewolf_game_start",
}

export const SCRIPT_EVENT_MESSAGES = {
    NONE: "",
}

export const SCRIPT_EVENT_COMMAND_IDS = {
    ROLE_REGISTRATION: "role_registration",
}

export const SYSTEMS = {
    INTERVAL_EVERY_TICK: 1,

    // https://learn.microsoft.com/ja-jp/minecraft/creator/scriptapi/minecraft/server/minecraft-server?view=minecraft-bedrock-stable#tickspersecond
    INTERVAL_EVERY_SECOND: TicksPerSecond,
}

export const ITEM_USE = {
    GAME_START_ITEM_ID: "minecraft:diamond", // 仮
}