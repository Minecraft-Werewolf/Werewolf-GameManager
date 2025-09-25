export const RoleFactionValues = [
    "villager",
    "werewolf",
    "fox",
    "neutral",
] as const;
type RoleFaction = (typeof RoleFactionValues)[number];

export const ResultTypeValues = [
    "villager",
    "werewolf",
    "fox",
] as const;
type ResultType = (typeof ResultTypeValues)[number];

export const ColorTypeValues = [
    "villager_lime",
    "werewolf_red",
    "fox_yellow",
    "neutral_blue",
] as const;
type ColorType = (typeof ColorTypeValues)[number];

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

export interface Role {
    id: string;
    name: string;
    description: string;
    faction: RoleFaction;
    count: {
        max?: number;
        step?: number;
    };
    color?: ColorType; // 指定しなければ、チームに基づいて自動で決定される
    divinationResult?: ResultType; // 占い結果
    mediumResult?: ResultType; // 霊視結果
    knownRoles?: string[]; // 初期に知っている役職
    handleGmaeEvents?: GameEventType[]; // 処理するゲームイベント
    appearance?: {
        toSelf?: RoleRef; // 自分目線の表示 (呪われし者とか)
        toOthers?: RoleRef; // 他人目線の表示 (テレパシストとか)
        toWerewolves?: RoleRef; // 人狼目線の表示 (スパイとか)
    }
    sortIndex: number; // ソート順
}