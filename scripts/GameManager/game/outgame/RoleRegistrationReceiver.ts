import { ConsoleManager } from "../../../Kairo/utils/ConsoleManager";
import type { Role } from "../../data/roles";
import { WerewolfGameManager } from "../WerewolfGameManager";

export class RoleRegistrationReceiver {
    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {}
    public static create(werewolfGameManager: WerewolfGameManager): RoleRegistrationReceiver {
        return new RoleRegistrationReceiver(werewolfGameManager);
    }

    public registrationRoles(args: string[]): void {
        const roles: Role[] = args.slice(1).map((arg: string) =>{
            let data;
            try {
                data = JSON.parse(arg);
            } catch (e) {
                ConsoleManager.error("Failed to parse role registration data: Invalid JSON format.");
            }

            if (data && WerewolfGameManager.getInstance().isRole(data)) {
                return data as Role;
            }
            return null;
        }).filter((role): role is Role => role !== null);

        this.werewolfGameManager.setRoles(args[0] as string, roles);
    }
}