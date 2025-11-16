export class GameSettingManager {
    constructor(outGameManager) {
        this.outGameManager = outGameManager;
    }
    static create(outGameManager) {
        return new GameSettingManager(outGameManager);
    }
}
