export class ItemManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }
    static create(gameManager) {
        return new ItemManager(gameManager);
    }
    replaceItemToPlayers(players) {
    }
}
