import { RoleRegistrationReceiver } from "./outgame/RoleRegistrationReceiver";
export class WerewolfGameManager {
    constructor() {
        this.roleRegistrationReceiver = RoleRegistrationReceiver.create(this);
    }
    static getInstance() {
        if (this.instance === null) {
            this.instance = new WerewolfGameManager();
        }
        return this.instance;
    }
    roleRegistration(args) {
        this.roleRegistrationReceiver.roleRegistration(args);
    }
}
WerewolfGameManager.instance = null;
