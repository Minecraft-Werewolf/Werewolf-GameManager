import { world } from "@minecraft/server";
import { OutGameEventManager } from "./events/OutGameEventManager";
import { PlayerInitializer } from "./PlayerInitializer";
export class OutGameManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.outGameEventManager = OutGameEventManager.create(this);
        this.playerInitializer = PlayerInitializer.create(this);
        this.init();
    }
    static create(systemManager) {
        return new OutGameManager(systemManager);
    }
    init() {
        world.getPlayers().forEach((player) => {
            this.initializePlayer(player);
        });
    }
    startGame() {
        this.systemManager.startGame();
    }
    getOutGameEventManager() {
        return this.outGameEventManager;
    }
    initializePlayer(player) {
        this.playerInitializer.initializePlayer(player);
    }
    openSettingsForm(player) {
        this.systemManager.openSettingsForm(player);
    }
}
