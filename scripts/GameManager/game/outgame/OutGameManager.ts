import { world, type Player } from "@minecraft/server";
import type { SystemManager } from "../SystemManager";
import { OutGameEventManager } from "./events/OutGameEventManager";
import { PlayerInitializer } from "./PlayerInitializer";
import {
    KairoUtils,
    type KairoCommand,
    type KairoResponse,
} from "../../../@core/kairo/utils/KairoUtils";
import { DefinitionManager } from "./definitions/DefinitionManager";
import { GameSettingManager } from "./settings/GameSettingManager";

export class OutGameManager {
    private readonly definitionManager = DefinitionManager.create(this);
    private readonly gameSettingManager = GameSettingManager.create(this);
    private readonly outGameEventManager = OutGameEventManager.create(this);
    private readonly playerInitializer = PlayerInitializer.create(this);
    private constructor(private readonly systemManager: SystemManager) {
        this.init();
    }
    public static create(systemManager: SystemManager): OutGameManager {
        return new OutGameManager(systemManager);
    }

    public async init(): Promise<void> {
        world.gameRules.pvp = false;

        const players = world.getPlayers();
        const playersKairoData = await KairoUtils.getPlayersKairoData();

        const isSizuku86 = players.find((player) => player.name === "sizuku86") !== undefined;

        players
            .sort((a, b) => {
                const dataA = playersKairoData.find((data) => data.playerId === a.id);
                const dataB = playersKairoData.find((data) => data.playerId === b.id);
                if (!dataA || !dataB) return 0;
                return dataA.joinOrder - dataB.joinOrder;
            })
            .forEach((player, index) => {
                if (isSizuku86) this.initializePlayer(player, player.name === "sizuku86");
                else this.initializePlayer(player, index === 0);
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
        this.gameSettingManager.opneSettingsForm(player);
    }

    public openFormRoleComposition(playerId: string): void {
        this.gameSettingManager.openFormRoleComposition(playerId);
    }

    public async requestRegistrationDefinitions(command: KairoCommand): Promise<KairoResponse> {
        return this.definitionManager.requestRegistrationDefinitions(command);
    }

    public getDefinitions<T>(
        addonListSaveKey: string,
        definitionSaveKeyPrefix: string,
    ): Promise<T[]> {
        return this.definitionManager.getDefinitions<T>(addonListSaveKey, definitionSaveKeyPrefix);
    }

    public getDefinitionsMap<T>(
        addonListSaveKey: string,
        definitionSaveKeyPrefix: string,
    ): Promise<Map<string, T[]>> {
        return this.definitionManager.getDefinitionsMap<T>(
            addonListSaveKey,
            definitionSaveKeyPrefix,
        );
    }
}
