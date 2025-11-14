import { TicksPerSecond } from "@minecraft/server";

export const SYSTEMS = {
    SEPARATOR: {
        SPACE: " ",
        LINE_CYAN: "§3" + "-".repeat(20) + "§r",
        LINE_YELLOW: "§e" + "-".repeat(20) + "§r",
    },
    INTERVAL: {
        EVERY_TICK: 1,
        EVERY_SECOND: TicksPerSecond,
        // https://learn.microsoft.com/ja-jp/minecraft/creator/scriptapi/minecraft/server/minecraft-server?view=minecraft-bedrock-stable#tickspersecond
    },
    DEFAULT_STAGE_SPAWNPOINT: {
        X: 0.5,
        Y: -58.94,
        Z: 24.5,
    },
    DEFAULT_STAGE_TELEPORT_OPTIONS: {
        CHECK_FOR_BLOCKS: false,
        DIMENSION: "overworld",
        KEEP_VELOCITY: false,
        ROTATION_X: 8,
        ROTATION_Y: 180,
    },

    // in ticks
    SHOW_GAME_TITLE: {
        FADEIN_DURATION: 0,
        STAY_DURATION: 60,
        FADEOUT_DURATION: 20,
        SOUND_ID: "mob.wolf.death",
        SOUND_PITCH: 1,
        SOUND_VOLUME: 1,
    },

    // in seconds
    SHOW_STAGE_TITLE: {
        BACKGROUND_FADEIN_TIME: 0.5,
        BACKGROUND_HOLD_TIME: 4.75,
        BACKGROUND_FADEOUT_TIME: 0.25,
        FADEIN_DURATION: 0,
        STAY_DURATION: 80,
        FADEOUT_DURATION: 5,
        SOUND_ID: "random.anvil_land",
        SOUND_PITCH: 1,
        SOUND_VOLUME: 1,
    },

    GAME_PREPARATION_COUNTDOWN: {
        SOUND_ID: "note.hat",
        SOUND_PITCH: 1,
        SOUND_VOLUME: 1,
        WARNING_SOUND_ID: "random.orb",
        WARNING_SOUND_PITCH: 1,
        WARNING_SOUND_VOLUME: 1,
    },

    GAME_START: {
        SOUND_ID: "random.levelup",
        SOUND_PITCH: 1,
        SOUND_VOLUME: 1,
    },

    GAME_FORCE_QUIT: {
        SOUND_ID: "note.bass",
        SOUND_PITCH: 1,
        SOUND_VOLUME: 1,
    },

    GAME_TERMINATION: {
        SOUND_ID: "random.anvil_use",
        SOUND_PITCH: 1,
        SOUND_VOLUME: 1,
    },

    GAME_TERMINATION_TITLE: {
        FADEIN_DURATION: 0,
        STAY_DURATION: 60,
        FADEOUT_DURATION: 10,
    },

    GAME_SHOW_RESULT: {
        DURATION: 100,
    },

    GAME_VICTORY: {
        SOUND_ID: "random.levelup",
        SOUND_PITCH: 1,
        SOUND_VOLUME: 1,
    },

    GAME_DEFEAT: {
        SOUND_ID: "random.explode",
        SOUND_PITCH: 1,
        SOUND_VOLUME: 1,
    },
};

export const GAMES = {
    UI_RESULT_WINNING_FACTION_TITLE_ANIMATION: {
        fadeInDuration: 0,
        stayDuration: 100,
        fadeOutDuration: 10,
    },
};
