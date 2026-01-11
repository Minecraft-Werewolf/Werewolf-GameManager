import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../constants/translate";
export const GameEventTypeValues = [
    "AfterGameStart",
    "BeforeMeetingStart",
    "AfterMeetingStart",
    "SkillUse",
    "SkillUseInMeeting",
    "Death",
];
/**
 * 役職が足りなかった場合に割り当てられるデフォルト役職
 * 初期化時に登録はせず、直接この場所からimportして使います
 * 後から消します
 */
export const defaultRole = {
    providerAddonId: "werewolf-gamemanager",
    id: "villager",
    name: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.ROLE_NAME_VILLAGER },
    description: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.ROLE_DESCRIPTION_VILLAGER },
    factionId: "villager",
    count: { max: 40 },
    sortIndex: 0,
};
