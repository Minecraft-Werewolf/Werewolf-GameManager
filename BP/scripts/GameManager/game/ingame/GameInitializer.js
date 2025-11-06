import { world } from "@minecraft/server";
export class GameInitializer {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
    }
    static create(werewolfGameManager) {
        return new GameInitializer(werewolfGameManager);
    }
    initialize() {
        world.sendMessage("Werewolf Game has started!");
    }
}
