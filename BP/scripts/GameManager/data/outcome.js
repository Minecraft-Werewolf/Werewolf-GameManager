import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../constants/translate";
export const defaultGameOutcomeRules = [
    {
        id: "timeUp",
        priority: 9900,
        condition: { type: "remainingTime", operator: "==", value: 0 },
        outcome: { type: "draw", reason: "timeUp" },
        presentation: {
            title: {
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_PRESENTATION_TIMEUP_TITLE,
            },
            message: {
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_PRESENTATION_TIMEUP_MESSAGE,
            },
        },
    },
    {
        id: "noPlayerAlive",
        priority: 9800,
        condition: { type: "playerAliveCount", operator: "==", value: 0 },
        outcome: { type: "draw", reason: "noPlayerAlive" },
        presentation: {
            title: {
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_ANNIHILATION_TITLE,
            },
            message: {
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_ANNIHILATION_MESSAGE,
            },
        },
    },
];
