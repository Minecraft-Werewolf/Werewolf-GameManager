import type { RawMessage } from "@minecraft/server";
import { properties } from "../../properties";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../constants/translate";
import type { KairoCommand } from "../../Kairo/utils/KairoUtils";

export interface SettingNodeBase {
    id: string;
    title: RawMessage;
    iconPath?: string;
    order?: number;
}

export interface SettingCategoryNode extends SettingNodeBase {
    type: "category";
    children: SettingNode[];
}

export interface SettingItemNode extends SettingNodeBase {
    type: "item";
    command: KairoCommand;
}

export type SettingNode = SettingCategoryNode | SettingItemNode;

export const ROOT_SETTINGS: SettingCategoryNode = {
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
