import type { RawMessage } from "@minecraft/server";
import type { Condition } from "./types/conditions";

export interface VictoryCondition {
    priority: number;
    condition: Condition;
    description: RawMessage;
    presentation: {
        title: RawMessage;
        message: RawMessage;
    };
}

export interface FactionDefinition {
    providerAddonId: string; // 登録要求時に GameManager が独自に付与する。定義側では不要
    id: string;
    defaultRoleId: string;
    type: FactionCategory;
    name: RawMessage;
    description: RawMessage;
    defaultColor: string;
    victoryCondition: VictoryCondition;
    sortIndex: number;
}

export type FactionCategory = "standard" | "independent" | "neutral";
