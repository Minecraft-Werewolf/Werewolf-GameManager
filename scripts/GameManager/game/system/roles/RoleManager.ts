import type { RoleDefinition } from "../../../data/roles";
import type { SystemManager } from "../../SystemManager";
import { RoleDataValidator } from "./RoleDataValidator";
import { RoleRegister } from "./RoleRegister";
import { RoleRegistrationRequester } from "./RoleRegistrationRequester";

export class RoleManager {
    private readonly roleDataValidator: RoleDataValidator;
    private readonly roleRegister: RoleRegister;
    private readonly roleRegistrationRequester: RoleRegistrationRequester;

    private readonly registeredRoleDefinitions: Map<string, RoleDefinition[]> = new Map();
    private readonly selectedRolesForNextGame: RoleDefinition[] = [];

    private constructor(private readonly systemManager: SystemManager) {
        this.roleDataValidator = RoleDataValidator.create(this);
        this.roleRegister = RoleRegister.create(this);
        this.roleRegistrationRequester = RoleRegistrationRequester.create(this);
    }
    public static create(systemManager: SystemManager): RoleManager {
        return new RoleManager(systemManager);
    }

    public registerRoles(addonId: string, roles: unknown[]): void {
        this.roleRegister.registerRoles(addonId, roles);
    }

    public isRole(data: unknown): boolean {
        return this.roleDataValidator.isRole(data);
    }

    public setRoles(addonId: string, roles: RoleDefinition[]): void {
        this.registeredRoleDefinitions.set(addonId, roles);
    }

    public requestRoleRegistration(): void {
        this.roleRegistrationRequester.request();
    }

    public getRegisteredRoleDefinitions(): Map<string, RoleDefinition[]> {
        return this.registeredRoleDefinitions;
    }

    public getSelectedRolesForNextGame(): RoleDefinition[] {
        return this.selectedRolesForNextGame;
    }
}
