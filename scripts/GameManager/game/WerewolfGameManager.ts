import type { Role } from "../data/roles";
import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegister } from "./outgame/RoleRegister";
import { ScriptEventReceiver } from "./ScriptEventReceiver";

export class WerewolfGameManager {
    private readonly scriptEventReceiver: ScriptEventReceiver;
    private readonly roleRegistrationReceiver: RoleRegister;
    private readonly roleDataValidator: RoleDataValidator;
    private readonly roles: Map<string, Role[]> = new Map();

    private constructor() {
        this.scriptEventReceiver = ScriptEventReceiver.create(this);
        this.roleRegistrationReceiver = RoleRegister.create(this);
        this.roleDataValidator = RoleDataValidator.create(this);
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
}