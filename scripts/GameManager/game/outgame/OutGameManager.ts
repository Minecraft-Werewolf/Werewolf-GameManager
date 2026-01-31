import { world, type Player } from "@minecraft/server";
import type { SystemManager } from "../SystemManager";
import { OutGameEventManager } from "./events/OutGameEventManager";
import { PlayerInitializer } from "./PlayerInitializer";
import { KairoUtils } from "../../../Kairo/utils/KairoUtils";

export class OutGameManager {
    private readonly outGameEventManager: OutGameEventManager;
    private readonly playerInitializer: PlayerInitializer;
    private constructor(private readonly systemManager: SystemManager) {
        this.outGameEventManager = OutGameEventManager.create(this);
        this.playerInitializer = PlayerInitializer.create(this);

        this.init();
    }
    public static create(systemManager: SystemManager): OutGameManager {
        return new OutGameManager(systemManager);
    }

    public async init(): Promise<void> {
        const players = world.getPlayers();
        const playersKairoData = await KairoUtils.getPlayersKairoData();

        players
            .sort((a, b) => {
                const dataA = playersKairoData.find((data) => data.playerId === a.id);
                const dataB = playersKairoData.find((data) => data.playerId === b.id);
                if (!dataA || !dataB) return 0;
                return dataA.joinOrder - dataB.joinOrder;
            })
            .forEach((player, index) => {
                this.initializePlayer(player, index === 0);
            });
    }

    public startGame(): void {
        this.systemManager.startGame();
    }

    public getOutGameEventManager(): OutGameEventManager {
        return this.outGameEventManager;
    }

    public initializePlayer(player: Player, isHost: boolean): void {
        this.playerInitializer.initializePlayer(player, isHost);
    }

    public openSettingsForm(player: Player): void {
        this.systemManager.openSettingsForm(player);
    }
}
