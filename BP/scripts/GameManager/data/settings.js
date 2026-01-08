import { properties } from "../../properties";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../constants/translate";
import { SCRIPT_EVENT_COMMAND_IDS } from "../constants/scriptevent";
export const ROOT_SETTINGS = {
    id: "root",
    title: {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_SETTING_TITLE,
    },
    type: "category",
    children: [
        {
            id: "RoleComposition",
            title: {
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_COMPOSITION_TITLE,
            },
            type: "item",
            command: {
                commandId: SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_ROLE_COMPOSITION,
                targetAddonId: properties.id,
            },
            order: 100,
        },
        {
            id: "GameSettings",
            title: {
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_SETTING_TITLE,
            },
            type: "category",
            order: 200,
            children: [
                {
                    id: "RoleSettings",
                    title: {
                        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_SETTING_TITLE,
                    },
                    type: "item",
                    command: {
                        commandId: SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_ROLE_SETTINGS,
                        targetAddonId: properties.id,
                    },
                    order: 100,
                },
                {
                    id: "GameSettings",
                    title: {
                        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_SETTING_TITLE,
                    },
                    type: "item",
                    command: {
                        commandId: SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_GAME_SETTINGS,
                        targetAddonId: properties.id,
                    },
                    order: 200,
                },
            ],
        },
        {
            id: "Credit",
            title: {
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME.CREDITS.TITLE,
            },
            type: "item",
            command: {
                commandId: SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_WEREWOLF_GAME_CREDIT,
                targetAddonId: properties.id,
            },
            order: 10000,
        },
    ],
};
