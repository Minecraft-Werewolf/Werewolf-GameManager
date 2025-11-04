import type { Role } from "../data/roles";
import { IntervalManager } from "./ingame/IntervalManager";
import { EventManager } from "./events/EventManager";
import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegister } from "./outgame/RoleRegister";
import { ScriptEventReceiver } from "./ScriptEventReceiver";

export class WerewolfGameManager {
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly roleRegistrationReceiver: RoleRegister;
    private readonly roleDataValidator: RoleDataValidator;
    private readonly intervalManager: IntervalManager;
    private readonly eventManager: EventManager;
    private readonly roles: Map<string, Role[]> = new Map();

    private constructor() {
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.roleRegistrationReceiver = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
        this.intervalManager = IntervalManager.create(this);
        this.eventManager = EventManager.create(this);
    }
    private static instance: WerewolfGameManager | null = null;

    public static getInstance(): WerewolfGameManager {
        if (this.instance === null) {
            this.instance = new WerewolfGameManager();
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

    public onEveryTickInGame(): void {
        // ゲーム中の毎ティック処理
    }

    public onEverySecondInGame(): void {
        // ゲーム中の毎秒処理
    }

    public startInGameIntervals(): void {
        this.intervalManager.runIntervals();
    }

    public stopInGameIntervals(): void {
        this.intervalManager.clearIntervals();
    }
}