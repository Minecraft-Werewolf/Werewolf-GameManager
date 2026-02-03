import { type Player } from "@minecraft/server";
import { InGameManager, type IngameConstants } from "./ingame/InGameManager";
import { OutGameManager } from "./outgame/OutGameManager";
import { SystemEventManager } from "./system/events/SystemEventManager";
import { RoleManager } from "./system/roles/RoleManager";
import { ScriptEventReceiver } from "./system/ScriptEventReceiver";
import { WorldStateChangeBroadcaster } from "./system/WorldStateChangeBroadcaster";
import { WorldStateChanger } from "./system/WorldStateChanger";
import { GameSettingManager } from "./system/settings/GameSettingManager";
import type { RoleDefinition } from "../data/roles";
import { FactionManager } from "./system/factions/FactionManager";
import type { FactionDefinition } from "../data/factions";
import {
    KairoUtils,
    type KairoCommand,
    type KairoResponse,
} from "../../@core/kairo/utils/KairoUtils";
import { SystemMonitor } from "./system/SystemMonitor";

export enum GameWorldState {
    OutGame = "OutGame",
    InGame = "InGame",
}

export class SystemManager {
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly systemEventManager: SystemEventManager;
    private readonly systemMonitor: SystemMonitor;
    private readonly worldStateChanger: WorldStateChanger;
    private readonly worldStateChangeBroadcaster: WorldStateChangeBroadcaster;
    private readonly factionManager: FactionManager;
    private readonly roleManager: RoleManager;
    private readonly gameSettingManager: GameSettingManager;
    private inGameManager: InGameManager | null = null;
    private outGameManager: OutGameManager | null = null;
    private currentWorldState: GameWorldState | null = null;

    private constructor() {
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.systemEventManager = SystemEventManager.create(this);
        this.systemMonitor = SystemMonitor.create(this);
        this.worldStateChanger = WorldStateChanger.create(this);
        this.worldStateChangeBroadcaster = WorldStateChangeBroadcaster.create(this);
        this.factionManager = FactionManager.create(this);
        this.roleManager = RoleManager.create(this);
        this.gameSettingManager = GameSettingManager.create(this);
    }

    // アドオン初期化時の処理
    public init(): void {
        this.changeWorldState(GameWorldState.OutGame);
    }

    private static instance: SystemManager | null = null;

    public static getInstance(): SystemManager {
        if (this.instance === null) {
            this.instance = new SystemManager();
        }
        return this.instance;
    }

    public async handleScriptEvent(data: KairoCommand): Promise<void | KairoResponse> {
        return this.scriptEventReceiver.handleScriptEvent(data);
    }

    public subscribeEvents(): void {
        this.systemEventManager.subscribeAll();
    }

    public unsubscribeEvents(): void {
        this.systemEventManager.unsubscribeAll();
    }

    public startGame(): void {
        if (this.currentWorldState !== GameWorldState.OutGame) return;
        this.changeWorldState(GameWorldState.InGame);
        this.inGameManager?.gameStart();
    }

    public resetGame(): void {
        if (this.currentWorldState !== GameWorldState.InGame) return;
        this.inGameManager?.gameReset();
        this.changeWorldState(GameWorldState.OutGame);
    }

    public changeWorldState(nextState: GameWorldState): void {
        this.worldStateChanger.change(nextState);
    }

    public getWorldState(): GameWorldState | null {
        return this.currentWorldState;
    }
    public setWorldState(state: GameWorldState): void {
        this.currentWorldState = state;
    }

    public getInGameManager(): InGameManager | null {
        return this.inGameManager;
    }
    public setInGameManager(v: InGameManager | null) {
        this.inGameManager = v;
    }

    public getOutGameManager(): OutGameManager | null {
        return this.outGameManager;
    }
    public setOutGameManager(v: OutGameManager | null) {
        this.outGameManager = v;
    }

    public createInGameManager(ingameConstants: IngameConstants): InGameManager {
        return InGameManager.create(this, ingameConstants);
    }

    public createOutGameManager(): OutGameManager {
        return OutGameManager.create(this);
    }

    public broadcastWorldStateChange(
        next: GameWorldState,
        ingameConstants: IngameConstants | null,
    ): void {
        this.worldStateChangeBroadcaster.broadcast(next, ingameConstants);
    }

    public openSettingsForm(player: Player): void {
        this.gameSettingManager.opneSettingsForm(player);
    }

    public openFormRoleComposition(playerId: string): void {
        this.gameSettingManager.openFormRoleComposition(playerId);
    }

    public getRegisteredRoleDefinitions(): Map<string, RoleDefinition[]> {
        return this.roleManager.getRegisteredRoleDefinitions();
    }

    public getSelectedRolesForNextGame(): RoleDefinition[] {
        return this.roleManager.getSelectedRolesForNextGame();
    }

    public registerFactions(addonId: string, factions: unknown[]): void {
        this.factionManager.registerFactions(addonId, factions);
    }

    public requestFactionReRegistration(): void {
        this.factionManager.requestFactionReRegistration();
    }

    public registerRoles(addonId: string, roles: unknown[]): void {
        this.roleManager.registerRoles(addonId, roles);
    }

    public requestRoleReRegistration(): void {
        this.roleManager.requestRoleReRegistration();
    }

    public sortRoleDefinitions(roles: RoleDefinition[]): RoleDefinition[] {
        return this.roleManager.sortRoleDefinitions(roles);
    }

    public getRoleComposition() {
        return this.roleManager.getSelectedRolesForNextGame();
    }

    public getFactionData(factionId: string): FactionDefinition | null {
        return this.factionManager.getFactionData(factionId);
    }

    public getFactionDefinitions() {
        return this.factionManager.getSelectedFactionsForNextGame();
    }

    public getRegisteredFactionDefinitions(): Map<string, FactionDefinition[]> {
        return this.factionManager.getRegisteredFactionDefinitions();
    }

    public getWerewolfGameDataDTO(): KairoResponse {
        if (!this.inGameManager)
            return KairoUtils.buildKairoResponse(
                {},
                false,
                "The game is not currently in progress.",
            );
        return this.inGameManager.getWerewolfGameDataDTO();
    }

    public monitorSystem(): void {
        this.systemMonitor.monitor();
    }

    public compareRoleDifinition(a: RoleDefinition, b: RoleDefinition): number {
        return this.roleManager.compareRoleDifinition(a, b);
    }
}
