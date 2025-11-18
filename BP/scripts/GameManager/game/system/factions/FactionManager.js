export class FactionManager {
    constructor(roleManager) {
        this.roleManager = roleManager;
        this.registeredFactionDefinitions = new Map();
        this.selectedFactionsForNextGame = [];
    }
    static create(roleManager) {
        return new FactionManager(roleManager);
    }
}
