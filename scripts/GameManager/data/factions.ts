import type { RawMessage } from "@minecraft/server";

export interface FactionDefinition {
    providerAddonId: string; // 登録要求時に GameManager が独自に付与する。定義側では不要
    id: string;
    name: RawMessage;
    description: RawMessage;
    defaultColor: string;
    victoryCondition: {
        description: RawMessage;
    }; // あとで勝利条件をカスタム定義できるようにする
}
