import { TicksPerSecond } from "@minecraft/server"

export const SYSTEMS = {
    INTERVAL_EVERY_TICK: 1,

    // https://learn.microsoft.com/ja-jp/minecraft/creator/scriptapi/minecraft/server/minecraft-server?view=minecraft-bedrock-stable#tickspersecond
    INTERVAL_EVERY_SECOND: TicksPerSecond,

    // in ticks
    SHOW_TITLE_FADEIN_DURATION: 0,
    SHOW_TITLE_STAY_DURATION: 60,
    SHOW_TITLE_FADEOUT_DURATION: 20,
    SHOW_TITLE_SOUND: "mob.wolf.death",
    SHOW_TITLE_SOUND_PITCH: 1,
    SHOW_TITLE_SOUND_VOLUME: 1,

    // in seconds
    SHOW_MAP_TITLE_BACKGROUND_FADEIN_TIME: 0.5,
    SHOW_MAP_TITLE_BACKGROUND_HOLD_TIME: 4.75,
    SHOW_MAP_TITLE_BACKGROUND_FADEOUT_TIME: 0.25,

    // in ticks
    SHOW_MAP_TITLE_FADEIN_DURATION: 0,
    SHOW_MAP_TITLE_STAY_DURATION: 80,
    SHOW_MAP_TITLE_FADEOUT_DURATION: 5,
    SHOW_MAP_TITLE_SOUND: "random.anvil_land",
    SHOW_MAP_TITLE_SOUND_PITCH: 1,
    SHOW_MAP_TITLE_SOUND_VOLUME: 1,
}