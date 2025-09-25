import { RoleRegistrationReceiver } from "./outgame/RoleRegistrationReceiver";

export class WerewolfGameManager {
    private readonly roleRegistrationReceiver: RoleRegistrationReceiver;
    private constructor() {
        this.roleRegistrationReceiver = RoleRegistrationReceiver.create(this);
    }
    private static instance: WerewolfGameManager | null = null;

    public static getInstance(): WerewolfGameManager {
        if (this.instance === null) {
            this.instance = new WerewolfGameManager();
        }
        return this.instance;
    }

    public roleRegistration(args: string[]): void {
        this.roleRegistrationReceiver.roleRegistration(args);
    }
}