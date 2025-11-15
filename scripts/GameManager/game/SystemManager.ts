import { InGameManager } from "./ingame/InGameManager";
import { OutGameManager } from "./outgame/OutGameManager";
import { SystemEventManager } from "./system/events/SystemEventManager";
import { RoleManager } from "./system/roles/RoleManager";
import { ScriptEventReceiver } from "./system/ScriptEventReceiver";

export enum GameWorldState {
    InGame,
    OutGame,
}

export class SystemManager {
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly systemEventManager: SystemEventManager;
    private readonly roleManager: RoleManager;
    private inGameManager: InGameManager | null = null;
    private outGameManager: OutGameManager | null = null;
    private currentWorldState: GameWorldState | null = null;

    private constructor() {
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.systemEventManager = SystemEventManager.create(this);
        this.roleManager = RoleManager.create(this);
    }

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

    public handleScriptEvent(message: string): void {
        this.scriptEventReceiver.handleScriptEvent(message);
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
        if (this.currentWorldState === nextState) return;

        switch (nextState) {
            case GameWorldState.InGame:
                this.enterInGame();
                break;
            case GameWorldState.OutGame:
                this.enterOutGame();
                break;
        }
    }

    public registerRoles(args: string[]): void {
        this.roleManager.registerRoles(args);
    }

    private enterInGame(): void {
        this.outGameManager?.getOutGameEventManager().unsubscribeAll();
        this.outGameManager = null;

        this.inGameManager = InGameManager.create(this);
        this.inGameManager.getInGameEventManager().subscribeAll();

        this.currentWorldState = GameWorldState.InGame;
    }

    private enterOutGame(): void {
        this.inGameManager?.getInGameEventManager().unsubscribeAll();
        this.inGameManager = null;

        this.outGameManager = OutGameManager.create(this);
        this.outGameManager.getOutGameEventManager().subscribeAll();

        this.currentWorldState = GameWorldState.OutGame;
    }
}
