import type { Role } from "../data/roles";
import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegistrationReceiver } from "./outgame/RoleRegistrationReceiver";

export class WerewolfGameManager {
    private readonly roleRegistrationReceiver: RoleRegistrationReceiver;
    private readonly roleDataValidator: RoleDataValidator;
    private readonly roles: Map<string, Role[]> = new Map();

    private constructor() {
        this.roleRegistrationReceiver = RoleRegistrationReceiver.create(this);
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
}