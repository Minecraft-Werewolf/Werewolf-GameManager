import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import type { Role } from "../../../data/roles";
import type { RoleManager } from "./RoleManager";

export class RoleRegister {
    private constructor(private readonly roleManager: RoleManager) {}
    public static create(roleManager: RoleManager): RoleRegister {
        return new RoleRegister(roleManager);
    }

    public registerRoles(args: string[]): void {
        const roles: Role[] = args
            .slice(1)
            .map((arg: string) => {
                let data;
                try {
                    data = JSON.parse(arg);
                } catch (e) {
                    ConsoleManager.error(
                        "Failed to parse role registration data: Invalid JSON format.",
                    );
                }

                if (data && this.roleManager.isRole(data)) {
                    return data as Role;
                }
                return null;
            })
            .filter((role): role is Role => role !== null);

        this.roleManager.setRoles(args[0] as string, roles);
    }
}
