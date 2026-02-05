import { KairoUtils, type KairoResponse } from "../../../@core/kairo/utils/KairoUtils";
import type { FactionDefinition } from "../../data/factions";
import type { RoleGroupDefinition } from "../../data/rolegroup";
import type { RoleDefinition } from "../../data/roles";
import type { SettingDefinition } from "../../data/settings";
import type { DefinitionType } from "../system/definitions/DefinitionManager";
import type { RoleCountMap } from "../system/definitions/roles/RoleDefinitionRegistry";
import type { InGameManager } from "./InGameManager";
import type { PlayerData } from "./game/gameplay/PlayerData";
import { PlayersDataManager } from "./game/gameplay/PlayersDataManager";

export type IngameConstants = {
    roleComposition: RoleCountMap;
    roleDefinitions: Record<string, RoleDefinition[]>;
    factionDefinitions: Record<string, FactionDefinition[]>;
    roleGroupDefinitions: Record<string, RoleGroupDefinition[]>;
    settingDefinitions: Record<string, SettingDefinition[]>;
};

export type WerewolfGameData = {
    remainingTicks: number;
    playersData: PlayerDataDTO[];
};

export type PlayerDataDTO = {
    player: {
        id: string;
        name: string;
    };
    role: RoleDefinition | null;
    isAlive: boolean;
    isLeave: boolean;
    isVictory: boolean;
};

export class WerewolfGameDataManager {
    private _remainingTicks: number = 0;
    private readonly playersDataManager: PlayersDataManager;
    private constructor(
        private readonly inGameManager: InGameManager,
        private readonly inGameConstants: IngameConstants,
    ) {
        this._remainingTicks = 12000; // 後から設定をいじれるような仕組みを作った時に、ここでそれを使って初期化するようにする
        this.playersDataManager = PlayersDataManager.create(this);
    }
    public static create(
        inGameManager: InGameManager,
        ingameConstants: IngameConstants,
    ): WerewolfGameDataManager {
        return new WerewolfGameDataManager(inGameManager, ingameConstants);
    }

    public getWerewolfGameDataDTO(): KairoResponse {
        return KairoUtils.buildKairoResponse(this.buildWerewolfGameData());
    }

    public getInGameManager(): InGameManager {
        return this.inGameManager;
    }

    public getPlayersDataManager(): PlayersDataManager {
        return this.playersDataManager;
    }

    public getPlayerData(playerId: string): PlayerData {
        return this.playersDataManager.get(playerId);
    }

    public getPlayersData(): readonly PlayerData[] {
        return this.playersDataManager.getPlayersData();
    }

    public get remainingTicks(): number {
        return this._remainingTicks;
    }

    public updateRemainingTicks(): void {
        if (this._remainingTicks > 0) {
            this._remainingTicks--;
        }
    }

    private buildWerewolfGameData(): WerewolfGameData {
        const playersDataDTO: PlayerDataDTO[] = this.getPlayersData().map((playerData) => ({
            player: {
                id: playerData.player.id,
                name: playerData.player.name,
            },
            role: playerData.role,
            isAlive: playerData.isAlive,
            isLeave: playerData.isLeave,
            isVictory: playerData.isVictory,
        }));

        return {
            remainingTicks: this._remainingTicks,
            playersData: playersDataDTO,
        };
    }

    public getRoleComposition(): RoleCountMap {
        return this.inGameConstants.roleComposition;
    }

    public getDefinitionsMap<T>(type: DefinitionType): ReadonlyMap<string, readonly T[]> {
        switch (type) {
            case "role":
                return this.toReadonlyMap(this.inGameConstants.roleDefinitions) as ReadonlyMap<
                    string,
                    readonly T[]
                >;
            case "faction":
                return this.toReadonlyMap(this.inGameConstants.factionDefinitions) as ReadonlyMap<
                    string,
                    readonly T[]
                >;
            case "roleGroup":
                return this.toReadonlyMap(this.inGameConstants.roleGroupDefinitions) as ReadonlyMap<
                    string,
                    readonly T[]
                >;
            case "setting":
                return this.toReadonlyMap(this.inGameConstants.settingDefinitions) as ReadonlyMap<
                    string,
                    readonly T[]
                >;
        }
    }

    public getDefinitions<T>(type: DefinitionType): readonly T[] {
        switch (type) {
            case "role":
                return Object.values(this.inGameConstants.roleDefinitions).flat() as T[];
            case "faction":
                return Object.values(this.inGameConstants.factionDefinitions).flat() as T[];
            case "roleGroup":
                return Object.values(this.inGameConstants.roleGroupDefinitions).flat() as T[];
            case "setting":
                return Object.values(this.inGameConstants.settingDefinitions).flat() as T[];
        }
    }

    public getDefinitionsByAddon<T>(type: DefinitionType, addonId: string): readonly T[] {
        switch (type) {
            case "role":
                return (this.inGameConstants.roleDefinitions[addonId] ?? []) as T[];
            case "faction":
                return (this.inGameConstants.factionDefinitions[addonId] ?? []) as T[];
            case "roleGroup":
                return (this.inGameConstants.roleGroupDefinitions[addonId] ?? []) as T[];
            case "setting":
                return (this.inGameConstants.settingDefinitions[addonId] ?? []) as T[];
        }
    }

    public getDefinitionById<T extends { id: string }>(
        type: DefinitionType,
        id: string,
    ): T | undefined {
        return this.getDefinitions<T>(type).find((d) => d.id === id);
    }

    public getRoleCount(roleId: string): number {
        return this.inGameConstants.roleComposition[roleId] ?? 0;
    }

    public getEnabledRoleIds(): string[] {
        return Object.keys(this.inGameConstants.roleComposition);
    }

    public getEnabledRoles(): RoleDefinition[] {
        return this.getEnabledRoleIds()
            .map((id) => this.getDefinitionById<RoleDefinition>("role", id))
            .filter((r): r is RoleDefinition => r !== undefined);
    }

    private toReadonlyMap<T>(record: Record<string, T[]>): ReadonlyMap<string, readonly T[]> {
        return new Map(
            Object.entries(record).map(([addonId, defs]) => [addonId, defs as readonly T[]]),
        );
    }
}
