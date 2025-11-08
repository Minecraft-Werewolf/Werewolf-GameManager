import type { Role } from "../data/roles";
import { IntervalManager } from "./ingame/interval/IntervalManager";
import { EventManager } from "./events/EventManager";
import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegister } from "./outgame/RoleRegister";
import { ScriptEventReceiver } from "./ScriptEventReceiver";
import { GameInitializer } from "./ingame/init/GameInitializer";
import { GamePreparationManager } from "./ingame/GamePreparationManager";

export class WerewolfGameManager {
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly roleRegistrationReceiver: RoleRegister;
    private readonly roleDataValidator: RoleDataValidator;
    private readonly intervalManager: IntervalManager;
    private readonly eventManager: EventManager;
    private readonly gameInitializer: GameInitializer;
    private readonly gamePreparationManager: GamePreparationManager;
    private readonly roles: Map<string, Role[]> = new Map();

    private constructor() {
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.roleRegistrationReceiver = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
        this.intervalManager = IntervalManager.create(this);
        this.eventManager = EventManager.create(this);
        this.gameInitializer = GameInitializer.create(this);
        this.gamePreparationManager = GamePreparationManager.create(this);
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

    public gameInitialization(): void {
        this.gameInitializer.runInitializationAsync();
    }

    public gamePreparation(): void {
        this.gamePreparationManager.runPreparationAsync();
    }

    public getIntervalManager(): IntervalManager {
        return this.intervalManager;
    }
}