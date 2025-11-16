import { properties } from "../../properties";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../constants/translate";
export const ROOT_SETTINGS = {
    id: "root",
    title: {
        translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_SETTING_TITLE,
    },
    type: "category",
    children: [
        {
            id: "RoleAssignment",
            title: {
                translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_ROLE_ASSIGNMENT_TITLE,
            },
            type: "item",
            command: {
                commandId: "",
                addonId: properties.id,
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
                        commandId: "",
                        addonId: properties.id,
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
                        commandId: "",
                        addonId: properties.id,
                    },
                    order: 200,
                },
            ],
        },
    ],
};
