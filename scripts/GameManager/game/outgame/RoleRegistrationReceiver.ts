import type { WerewolfGameManager } from "../WerewolfGameManager";

export class RoleRegistrationReceiver {
    private constructor(werewolfGameManager: WerewolfGameManager) {}
    public static create(werewolfGameManager: WerewolfGameManager): RoleRegistrationReceiver {
        return new RoleRegistrationReceiver(werewolfGameManager);
    }

    public roleRegistration(args: string[]): void {
        args.forEach((arg: string) =>{
            try {
                const data = JSON.parse(arg);
                
            } catch (e) {

            }
        });
    }
}