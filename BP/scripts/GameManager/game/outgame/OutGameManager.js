import { system, world } from "@minecraft/server";
import { OutGameEventManager } from "./events/OutGameEventManager";
import { PlayerInitializer } from "./PlayerInitializer";
import { GameSettingManager } from "./settings/GameSettingManager";
export class OutGameManager {
    constructor(systemManager) {
        this.systemManager = systemManager;
        this.outGameEventManager = OutGameEventManager.create(this);
        this.playerInitializer = PlayerInitializer.create(this);
        this.gameSettingManager = GameSettingManager.create(this);
        system.run(() => this.init());
    }
    static create(systemManager) {
        return new OutGameManager(systemManager);
    }
    init() {
        const players = world.getPlayers();
        players.forEach((player) => {
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
        this.gameSettingManager.openSettingsForm(player);
    }
}
