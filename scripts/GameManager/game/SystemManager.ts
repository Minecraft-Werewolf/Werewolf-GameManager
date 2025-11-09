import type { Role } from "../data/roles";
import { EventManager } from "./events/EventManager";
import { GameManager } from "./ingame/GameManager";
import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegister } from "./outgame/RoleRegister";
import { ScriptEventReceiver } from "./ScriptEventReceiver";

export class SystemManager {
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly roleRegistrationReceiver: RoleRegister;
    private readonly roleDataValidator: RoleDataValidator;
    private readonly eventManager: EventManager;
    private _gameManagerInst: GameManager | null = null;

    private readonly roles: Map<string, Role[]> = new Map();

    private constructor() {
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.roleRegistrationReceiver = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
        this.eventManager = EventManager.create(this);
    }
    private static instance: SystemManager | null = null;

    public static getInstance(): SystemManager {
        if (this.instance === null) {
            this.instance = new SystemManager();
        }
        return this.instance;
    }

    public registrationRoles(args: string[]): void {
        this.roleRegistrationReceiver.registrationRoles(args);
    }

    public isRole(data: unknown): boolean {
        return this.roleDataValidator.isRole(data);
    }

    public setRoles(addonId: string, roles: Role[]): void {
        this.roles.set(addonId, roles);
    }

    public handleOnScriptEvent(message: string): void {
        this.scriptEventReceiver.handleOnScriptEvent(message);
    }

    public subscribeEvents(): void {
        this.eventManager.subscribeAll();
    }

    public unsubscribeEvents(): void {
        this.eventManager.unsubscribeAll();
    }

    public async gameStart(): Promise<void> {
        this._gameManagerInst = GameManager.create();

        await this._gameManagerInst.gameStart();

        if (this._gameManagerInst !== null)
            this._gameManagerInst = null;
    }

    public gameReset(): void {
        if (this._gameManagerInst === null) return;

        this._gameManagerInst.gameReset();
    }
}