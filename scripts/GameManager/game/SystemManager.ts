import type { Player } from "@minecraft/server";
import { InGameManager } from "./ingame/InGameManager";
import { OutGameManager } from "./outgame/OutGameManager";
import { SystemEventManager } from "./system/events/SystemEventManager";
import { RoleManager } from "./system/roles/RoleManager";
import { ScriptEventReceiver } from "./system/ScriptEventReceiver";
import { WorldStateChangeBroadcaster } from "./system/WorldStateChangeBroadcaster";
import { WorldStateChanger } from "./system/WorldStateChanger";
import { GameSettingManager } from "./system/settings/GameSettingManager";
import type { KairoCommand } from "../../Kairo/utils/KairoUtils";
import type { RoleDefinition } from "../data/roles";

export enum GameWorldState {
    OutGame,
    InGame,
}

export class SystemManager {
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly systemEventManager: SystemEventManager;
    private readonly worldStateChanger: WorldStateChanger;
    private readonly worldStateChangeBroadcaster: WorldStateChangeBroadcaster;
    private readonly roleManager: RoleManager;
    private readonly gameSettingManager: GameSettingManager;
    private inGameManager: InGameManager | null = null;
    private outGameManager: OutGameManager | null = null;
    private currentWorldState: GameWorldState | null = null;

    private constructor() {
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.systemEventManager = SystemEventManager.create(this);
        this.worldStateChanger = WorldStateChanger.create(this);
        this.worldStateChangeBroadcaster = WorldStateChangeBroadcaster.create(this);
        this.roleManager = RoleManager.create(this);
        this.gameSettingManager = GameSettingManager.create(this);
    }

    public init(): void {
        this.changeWorldState(GameWorldState.OutGame);
        this.roleManager.requestRoleRegistration();
    }

    private static instance: SystemManager | null = null;

    public static getInstance(): SystemManager {
        if (this.instance === null) {
            this.instance = new SystemManager();
        }
        return this.instance;
    }

    public handleScriptEvent(data: KairoCommand): void {
        this.scriptEventReceiver.handleScriptEvent(data);
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

    public registerRoles(addonId: string, roles: unknown[]): void {
        this.roleManager.registerRoles(addonId, roles);
    }

    public getWorldState(): GameWorldState | null {
        return this.currentWorldState;
    }
    public setWorldState(state: GameWorldState): void {
        this.currentWorldState = state;
    }

    public getInGameManager() {
        return this.inGameManager;
    }
    public setInGameManager(v: InGameManager | null) {
        this.inGameManager = v;
    }

    public getOutGameManager() {
        return this.outGameManager;
    }
    public setOutGameManager(v: OutGameManager | null) {
        this.outGameManager = v;
    }

    public createInGameManager(): InGameManager {
        return InGameManager.create(this);
    }
    public createOutGameManager(): OutGameManager {
        return OutGameManager.create(this);
    }

    public broadcastWorldStateChange(next: GameWorldState): void {
        this.worldStateChangeBroadcaster.broadcast(next);
    }

    public openSettingsForm(player: Player): void {
        this.gameSettingManager.opneSettingsForm(player);
    }

    public openFormRoleAssignment(playerId: string): void {
        this.gameSettingManager.openFormRoleAssignment(playerId);
    }

    public getRegisteredRoleDefinitions(): Map<string, RoleDefinition[]> {
        return this.roleManager.getRegisteredRoleDefinitions();
    }

    public getSelectedRolesForNextGame(): RoleDefinition[] {
        return this.roleManager.getSelectedRolesForNextGame();
    }
}
