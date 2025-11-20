import type { RoleDefinition } from "../../../data/roles";
import type { SystemManager } from "../../SystemManager";
import { RoleDataValidator } from "./RoleDataValidator";
import {
    RoleRegistrationValidator,
    type ValidateRoleRegistrationResult,
} from "./RoleRegistratonValidator.ts";
import { RoleRegistrationNotifier } from "./RoleRegistrationNotifier";
import { RoleReRegistrationRequester } from "./RoleReRegistrationRequester";

export class RoleManager {
    private readonly roleDataValidator: RoleDataValidator;
    private readonly roleRegistrationValidator: RoleRegistrationValidator;
    private readonly roleRegistrationNotifier: RoleRegistrationNotifier;
    private readonly roleReRegistrationRequester: RoleReRegistrationRequester;

    private readonly registeredRoleDefinitions: Map<string, RoleDefinition[]> = new Map();
    private readonly selectedRolesForNextGame: RoleDefinition[] = [];

    private constructor(private readonly systemManager: SystemManager) {
        this.roleDataValidator = RoleDataValidator.create(this);
        this.roleRegistrationValidator = RoleRegistrationValidator.create(this);
        this.roleRegistrationNotifier = RoleRegistrationNotifier.create(this);
        this.roleReRegistrationRequester = RoleReRegistrationRequester.create(this);
    }
    public static create(systemManager: SystemManager): RoleManager {
        return new RoleManager(systemManager);
    }

    public registerRoles(addonId: string, roles: unknown[]): void {
        const validateResult: ValidateRoleRegistrationResult =
            this.roleRegistrationValidator.validateRoleRegistration(addonId, roles);

        this.roleRegistrationNotifier.notify(validateResult);

        if (!validateResult.isSuccessful) return;

        this.setRoles(addonId, validateResult.validatedRoles);
    }

    public setRoles(addonId: string, roles: RoleDefinition[]): void {
        this.registeredRoleDefinitions.set(addonId, roles);
    }

    public clearRoles(): void {
        this.registeredRoleDefinitions.clear();
    }

    public isRole(data: unknown): boolean {
        return this.roleDataValidator.isRole(data);
    }

    public requestRoleReRegistration(): void {
        this.clearRoles();
        this.roleReRegistrationRequester.request();
    }

    public getRegisteredRoleDefinitions(): Map<string, RoleDefinition[]> {
        return this.registeredRoleDefinitions;
    }

    public getSelectedRolesForNextGame(): RoleDefinition[] {
        return this.selectedRolesForNextGame;
    }
}
