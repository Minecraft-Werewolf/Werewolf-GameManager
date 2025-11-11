import type { Role } from "../data/roles";
import { InGameManager } from "./ingame/InGameManager";
import { OutGameManager } from "./outgame/OutGameManager";
import { SystemEventManager } from "./system/events/SystemEventManager";
import { RoleDataValidator } from "./system/roles/RoleDataValidator";
import { RoleRegister } from "./system/roles/RoleRegister";
import { ScriptEventReceiver } from "./system/ScriptEventReceiver";

export enum GameWorldState {
    InGame,
    OutGame,
}

export class SystemManager {
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly systemEventManager: SystemEventManager;
    private readonly roleRegister: RoleRegister;
    private readonly roleDataValidator: RoleDataValidator;
    private inGameManager: InGameManager | null = null;
    private outGameManager: OutGameManager | null = null;
    private currentWorldState: GameWorldState | null = null;

    private readonly roles: Map<string, Role[]> = new Map();

    private constructor() {
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.systemEventManager = SystemEventManager.create(this);
        this.roleRegister = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
    }

    public init(): void{
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

    public registerRoles(args: string[]): void {
        this.roleRegister.registerRoles(args);
    }

    public isRole(data: unknown): boolean {
        return this.roleDataValidator.isRole(data);
    }

    public setRoles(addonId: string, roles: Role[]): void {
        this.roles.set(addonId, roles);
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

    private enterInGame(): void {
        this.outGameManager?.getOutGameEventManager().unsubscribeAll();
        this.outGameManager = null;

        this.inGameManager = InGameManager.create(this);
        this.inGameManager.getInGameEventManager().subscribeAll();

        this.currentWorldState = GameWorldState.InGame;
    }

    private enterOutGame(): void {

        console.log("aiueo");
        this.inGameManager?.getInGameEventManager().unsubscribeAll();
        this.inGameManager = null;

        this.outGameManager = OutGameManager.create(this);
        this.outGameManager.getOutGameEventManager().subscribeAll();

        this.currentWorldState = GameWorldState.OutGame;
    }
}