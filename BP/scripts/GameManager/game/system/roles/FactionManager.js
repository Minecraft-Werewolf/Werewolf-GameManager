export class FactionManager {
    constructor(roleManager) {
        this.roleManager = roleManager;
        this.registeredFactionDefinitions = [];
    }
    static create(roleManager) {
        return new FactionManager(roleManager);
    }
}
