import { world } from "@minecraft/server";
import { GameManager } from "./game/GameManager";
import { GameInitializer } from "./game/init/GameInitializer";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../constants/translate";
import { KAIRO_COMMAND_TARGET_ADDON_IDS, SYSTEMS } from "../../constants/systems";
import { GameWorldState, type SystemManager } from "../SystemManager";
import { InGameEventManager } from "./events/InGameEventManager";
import { GameTerminator } from "./game/terminate/GameTerminator";
import { GameFinalizer } from "./game/GameFinalizer";
import type { PlayerData } from "./game/gameplay/PlayerData";
import { WerewolfGameDataManager, type IngameConstants } from "./WerewolfGameDataManager";
import { GamePreparationManager } from "./game/GamePreparationManager";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
import { KairoUtils, type KairoResponse } from "../../../@core/kairo/utils/KairoUtils";
import { ConsoleManager } from "../../../@core/kairo/utils/ConsoleManager";
import { GamePhase } from "./GamePhase";
import type { DefinitionType } from "../system/definitions/DefinitionManager";
import type { RoleDefinition } from "../../data/roles";
import type { RoleCountMap } from "../system/definitions/roles/RoleDefinitionRegistry";

export class InGameManager {
    private currentPhase: GamePhase = GamePhase.Waiting;

    private readonly gameInitializer: GameInitializer;
    private readonly gamePreparationManager: GamePreparationManager;
    private readonly gameManager: GameManager;
    private readonly gameTerminator: GameTerminator;
    private readonly gameFinalizer: GameFinalizer;
    private readonly inGameEventManager: InGameEventManager;
    private readonly werewolfGameDataManager: WerewolfGameDataManager;

    private isResetRequested = false;

    private constructor(
        private readonly systemManager: SystemManager,
        ingameConstants: IngameConstants,
    ) {
        this.gameInitializer = GameInitializer.create(this);
        this.gamePreparationManager = GamePreparationManager.create(this);
        this.gameManager = GameManager.create(this);
        this.gameTerminator = GameTerminator.create(this);
        this.gameFinalizer = GameFinalizer.create(this);
        this.inGameEventManager = InGameEventManager.create(this);
        this.werewolfGameDataManager = WerewolfGameDataManager.create(this, ingameConstants);
    }

    public static create(
        systemManager: SystemManager,
        ingameConstants: IngameConstants,
    ): InGameManager {
        return new InGameManager(systemManager, ingameConstants);
    }

    public async gameStart(): Promise<void> {
        this.isResetRequested = false;

        try {
            await this.runStep(async () => this.gameInitializer.runInitializationAsync());
            await this.runStep(async () => this.gamePreparationManager.runPreparationAsync());
            await this.runStep(async () => this.gameManager.startGameAsync());
            await this.runStep(async () => this.gameTerminator.runTerminationAsync());
            this.runStep(() => this.gameFinalizer.runFinalization());
        } catch (e) {
            console.warn(`[GameManager] Game start interrupted: ${String(e)}`);
        }
    }

    public gameFinalize(): void {
        this.systemManager.changeWorldState(GameWorldState.OutGame);
    }

    private async runStep(stepFn: () => Promise<void> | void): Promise<void> {
        if (this.isResetRequested) {
            throw new Error("Game execution cancelled (reset requested)");
        }
        await stepFn();
    }

    public gameReset(): void {
        if (this.isResetRequested) return;
        this.isResetRequested = true;

        switch (this.currentPhase) {
            case GamePhase.Initializing:
                this.gameInitializer.cancel();
                world.sendMessage({
                    translate:
                        WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_START_CANCELD_MESSAGE,
                });
                break;
            case GamePhase.Preparing:
                this.gamePreparationManager.stopPreparation();
                world.sendMessage({
                    translate:
                        WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_START_CANCELD_MESSAGE,
                });
                break;
            case GamePhase.InGame:
                this.gameManager.stopGame();
                world.sendMessage({
                    translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_FORCE_QUIT_MESSAGE,
                });
                break;
            case GamePhase.Result:
                world.sendMessage({
                    translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_FORCE_QUIT_MESSAGE,
                });
                break;
            case GamePhase.Waiting:
                break;
        }

        this.setCurrentPhase(GamePhase.Waiting);

        world.getPlayers().forEach((player) => {
            player.playSound(SYSTEMS.GAME_FORCE_QUIT.SOUND_ID, {
                location: player.location,
                pitch: SYSTEMS.GAME_FORCE_QUIT.SOUND_PITCH,
                volume: SYSTEMS.GAME_FORCE_QUIT.SOUND_VOLUME,
            });
        });

        this.gameFinalizer.runFinalization();
    }

    public getCurrentPhase(): GamePhase {
        return this.currentPhase;
    }

    public setCurrentPhase(phase: GamePhase): void {
        this.currentPhase = phase;
        this.broadcastPhaseChange(this.currentPhase);
    }

    public isResetPending(): boolean {
        return this.isResetRequested;
    }

    public getGameManager(): GameManager {
        return this.gameManager;
    }

    public getInGameEventManager(): InGameEventManager {
        return this.inGameEventManager;
    }

    public getPlayerData(playerId: string) {
        return this.werewolfGameDataManager.getPlayerData(playerId);
    }

    public getPlayersData(): readonly PlayerData[] {
        return this.werewolfGameDataManager.getPlayersData();
    }

    public getPlayersDataManager() {
        return this.werewolfGameDataManager.getPlayersDataManager();
    }

    public getWerewolfGameDataManager(): WerewolfGameDataManager {
        return this.werewolfGameDataManager;
    }

    public getWerewolfGameDataDTO(): KairoResponse {
        return this.werewolfGameDataManager.getWerewolfGameDataDTO();
    }

    public broadcastPhaseChange(phase: GamePhase): void {
        ConsoleManager.log(`Broadcasting phase change... New phase: ${phase}`);

        KairoUtils.sendKairoCommand(
            KAIRO_COMMAND_TARGET_ADDON_IDS.BROADCAST,
            SCRIPT_EVENT_COMMAND_IDS.INGAME_PHASE_CHANGE,
            {
                newPhase: phase,
            },
        );
    }

    public compareRoleDefinitions(a: RoleDefinition, b: RoleDefinition): number {
        return this.systemManager.compareRoleDefinitions(a, b);
    }

    public sortRoleDefinitions(roles: RoleDefinition[]): RoleDefinition[] {
        return this.systemManager.sortRoleDefinitions(roles);
    }

    public getDefinitionsMap<T>(type: DefinitionType): ReadonlyMap<string, readonly T[]> {
        return this.werewolfGameDataManager.getDefinitionsMap<T>(type);
    }

    public getDefinitions<T>(type: DefinitionType): readonly T[] {
        return this.werewolfGameDataManager.getDefinitions<T>(type);
    }

    public getDefinitionsByAddon<T>(type: DefinitionType, addonId: string): readonly T[] {
        return this.werewolfGameDataManager.getDefinitionsByAddon<T>(type, addonId);
    }

    public getDefinitionById<T extends { id: string }>(
        type: DefinitionType,
        id: string,
    ): T | undefined {
        return this.werewolfGameDataManager.getDefinitionById<T>(type, id);
    }

    public getRoleCount(roleId: string): number {
        return this.werewolfGameDataManager.getRoleCount(roleId);
    }

    public getRoleComposition(): RoleCountMap {
        return this.werewolfGameDataManager.getRoleComposition();
    }

    public getEnabledRoleIds(): string[] {
        return this.werewolfGameDataManager.getEnabledRoleIds();
    }

    public getEnabledRoles(): RoleDefinition[] {
        return this.werewolfGameDataManager.getEnabledRoles();
    }
}
