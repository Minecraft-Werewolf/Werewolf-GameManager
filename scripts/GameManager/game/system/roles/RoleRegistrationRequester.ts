import type { RoleManager } from "./RoleManager";

export class RoleRegistrationRequester {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleRegistrationRequester {
        return new RoleRegistrationRequester(roleManager);
    }

    public requestRoleRegistration(): void {}
}
