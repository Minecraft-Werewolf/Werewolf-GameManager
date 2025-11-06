import { TicksPerSecond } from "@minecraft/server"

export const SYSTEMS = {
    INTERVAL_EVERY_TICK: 1,

    // https://learn.microsoft.com/ja-jp/minecraft/creator/scriptapi/minecraft/server/minecraft-server?view=minecraft-bedrock-stable#tickspersecond
    INTERVAL_EVERY_SECOND: TicksPerSecond,

    SHOW_TITLE_FADEIN_DURATION: 0,
    SHOW_TITLE_STAY_DURATION: 50,
    SHOW_TITLE_FADEOUT_DURATION: 10,
}