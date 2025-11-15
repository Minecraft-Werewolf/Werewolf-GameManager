import type { Role } from "../../../data/roles";
import type { SystemManager } from "../../SystemManager";
import { RoleDataValidator } from "./RoleDataValidator";
import { RoleRegister } from "./RoleRegister";
import { RoleRegistrationRequester } from "./RoleRegistrationRequester";

export class RoleManager {
    private readonly roleDataValidator: RoleDataValidator;
    private readonly roleRegister: RoleRegister;
    private readonly roleRegistrationRequester: RoleRegistrationRequester;

    private readonly roles: Map<string, Role[]> = new Map();

    private constructor(private readonly systemManager: SystemManager) {
        this.roleDataValidator = RoleDataValidator.create(this);
        this.roleRegister = RoleRegister.create(this);
        this.roleRegistrationRequester = RoleRegistrationRequester.create(this);
    }
    public static create(systemManager: SystemManager): RoleManager {
        return new RoleManager(systemManager);
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
}
