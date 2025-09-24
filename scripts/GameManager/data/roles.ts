type RoleFaction =
    | "villager"
    | "werewolf"
    | "fox"
    | "neutral";

type ResultType =
    | "villager"
    | "werewolf"
    | "fox";

type ColorType =
    | "villager_lime"
    | "werewolf_red"
    | "fox_yellow"
    | "neutral_blue";

type GameEventType =
    | "AfterGameStart"
    | "BeforeMeetingStart"
    | "AfterMeetingStart"
    | "SkillUse"
    | "SkillUseInMeeting"
    | "Death";

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
    handleGmaeEvents: GameEventType[]; // 処理するゲームイベント
    appearance: {
        toSelf: RoleRef; // 自分目線の表示 (呪われし者とか)
        toOthers: RoleRef; // 他人目線の表示 (テレパシストとか)
        toWerewolves: RoleRef; // 人狼目線の表示 (スパイとか)
    }
    sortIndex: number; // ソート順
}