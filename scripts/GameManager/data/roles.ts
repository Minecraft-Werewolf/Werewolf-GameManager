import type { RawMessage } from "@minecraft/server";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../constants/translate";

export const GameEventTypeValues = [
    "AfterGameStart",
    "BeforeMeetingStart",
    "AfterMeetingStart",
    "SkillUse",
    "SkillUseInMeeting",
    "Death",
] as const;
type GameEventType = (typeof GameEventTypeValues)[number];

interface RoleKey {
    addonId: string;
    roleId: string;
}

type RoleRef = RoleKey;

export interface RoleDefinition {
    providerAddonId: string; // 登録要求時に GameManager が独自に付与する。定義側では不要
    id: string;
    name: RawMessage;
    description: RawMessage;
    factionId: string;
    isExcludedFromSurvivalCheck?: boolean; // 主に狂人枠で使用
    count?: {
        amount?: number;
        max?: number;
        step?: number;
    };
    color?: string; // 指定しなければ、チームに基づいて自動で決定される
    divinationResult?: string; // 占い結果
    mediumResult?: string; // 霊視結果
    knownRoles?: string[]; // 初期に知っている役職
    handleGmaeEvents?: GameEventType[]; // 処理するゲームイベント
    appearance?: {
        toSelf?: RoleRef; // 自分目線の表示 (呪われし者とか)
        toOthers?: RoleRef; // 他人目線の表示 (テレパシストとか)
        toWerewolves?: RoleRef; // 人狼目線の表示 (スパイとか)
    };
    sortIndex: number; // ソート順
}

/**
 * 役職が足りなかった場合に割り当てられるデフォルト役職
 * 初期化時に登録はせず、直接この場所からimportして使います
 * 後から消します
 */
export const defaultRole: RoleDefinition = {
    providerAddonId: "werewolf-gamemanager",
    id: "villager",
    name: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.ROLE_NAME_VILLAGER },
    description: { translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.ROLE_DESCRIPTION_VILLAGER },
    factionId: "villager",
    count: { max: 40 },
    sortIndex: 0,
};
