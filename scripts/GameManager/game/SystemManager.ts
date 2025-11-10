import type { Role } from "../data/roles";
import { InGameManager } from "./ingame/InGameManager";
import { OutGameManager } from "./outgame/OutGameManager";
import { SystemEventManager } from "./system/events/SystemEventManager";
import { RoleDataValidator } from "./system/roles/RoleDataValidator";
import { RoleRegister } from "./system/roles/RoleRegister";
import { ScriptEventReceiver } from "./system/ScriptEventReceiver";

export class SystemManager {
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly systemEventManager: SystemEventManager;
    private readonly roleRegister: RoleRegister;
    private readonly roleDataValidator: RoleDataValidator;
    private _inGameManagerInst: InGameManager | null = null;
    private _outGameManagerInst: OutGameManager | null = null;

    private readonly roles: Map<string, Role[]> = new Map();

    private constructor() {
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.systemEventManager = SystemEventManager.create(this);
        this.roleRegister = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);

        this.init();
    }

    private init(): void{
        this._outGameManagerInst = OutGameManager.create(this);
    }

    private static instance: SystemManager | null = null;

    public static getInstance(): SystemManager {
        if (this.instance === null) {
            this.instance = new SystemManager();
        }
        return this.instance;
    }

    public handleOnScriptEvent(message: string): void {
        this.scriptEventReceiver.handleOnScriptEvent(message);
    }

    public registrationRoles(args: string[]): void {
        this.roleRegister.registrationRoles(args);
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

    public async gameStart(): Promise<void> {
        this._inGameManagerInst = InGameManager.create(this);

        await this._inGameManagerInst.gameStart();

        if (this._inGameManagerInst !== null)
            this._inGameManagerInst = null;
    }

    public gameReset(): void {
        if (this._inGameManagerInst === null) return;

        this._inGameManagerInst.gameReset();
    }
}