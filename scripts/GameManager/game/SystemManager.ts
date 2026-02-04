import { type Player } from "@minecraft/server";
import { InGameManager, type IngameConstants } from "./ingame/InGameManager";
import { OutGameManager } from "./outgame/OutGameManager";
import { SystemEventManager } from "./system/events/SystemEventManager";
import { ScriptEventReceiver } from "./system/ScriptEventReceiver";
import { WorldStateChangeBroadcaster } from "./system/WorldStateChangeBroadcaster";
import { WorldStateChanger } from "./system/WorldStateChanger";
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
    private inGameManager: InGameManager | null = null;
    private outGameManager: OutGameManager | null = null;
    private currentWorldState: GameWorldState | null = null;

    private constructor() {
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.systemEventManager = SystemEventManager.create(this);
        this.systemMonitor = SystemMonitor.create(this);
        this.worldStateChanger = WorldStateChanger.create(this);
        this.worldStateChangeBroadcaster = WorldStateChangeBroadcaster.create(this);
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
        this.outGameManager?.openSettingsForm(player);
    }

    public openFormRoleComposition(playerId: string): void {
        this.outGameManager?.openFormRoleComposition(playerId);
    }

    public async requestRegistrationDefinitions(command: KairoCommand): Promise<KairoResponse> {
        if (!this.outGameManager)
            return KairoUtils.buildKairoResponse({}, false, "The game is currently in progress.");
        return this.outGameManager.requestRegistrationDefinitions(command);
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
}
