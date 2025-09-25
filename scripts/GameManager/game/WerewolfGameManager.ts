import { RoleDataValidator } from "./outgame/RoleDataValidator";
import { RoleRegistrationReceiver } from "./outgame/RoleRegistrationReceiver";

export class WerewolfGameManager {
    private readonly roleRegistrationReceiver: RoleRegistrationReceiver;
    private readonly roleDataValidator: RoleDataValidator;
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

    public roleRegistration(args: string[]): void {
        this.roleRegistrationReceiver.roleRegistration(args);
    }
}