import { ConsoleManager } from "../../../../Kairo/utils/ConsoleManager";
import type { Role } from "../../../data/roles";
import type { SystemManager } from "../../SystemManager";

export class RoleRegister {
    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): RoleRegister {
        return new RoleRegister(systemManager);
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

                if (data && this.systemManager.isRole(data)) {
                    return data as Role;
                }
                return null;
            })
            .filter((role): role is Role => role !== null);

        this.systemManager.setRoles(args[0] as string, roles);
    }
}
