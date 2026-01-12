import { KairoUtils, type KairoCommand, type KairoResponse } from "../../../Kairo/utils/KairoUtils";
import { SCRIPT_EVENT_COMMAND_IDS } from "../../constants/scriptevent";
import { type PlayerDataDTO } from "../ingame/game/gameplay/PlayerData";
import type { SystemManager } from "../SystemManager";

export class ScriptEventReceiver {
    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): ScriptEventReceiver {
        return new ScriptEventReceiver(systemManager);
    }

    public async handleScriptEvent(command: KairoCommand): Promise<void | KairoResponse> {
        switch (command.commandType) {
            case SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_START:
                this.systemManager.startGame();
                return;
            case SCRIPT_EVENT_COMMAND_IDS.WEREWOLF_GAME_RESET:
                this.systemManager.resetGame();
                return;
            case SCRIPT_EVENT_COMMAND_IDS.FACTION_REGISTRATION_REQUEST:
                this.systemManager.registerFactions(command.sourceAddonId, command.data.factions);
                return;
            case SCRIPT_EVENT_COMMAND_IDS.FACTION_RE_REGISTRATION_REQUEST:
                this.systemManager.requestFactionReRegistration();
                return;
            case SCRIPT_EVENT_COMMAND_IDS.ROLE_REGISTRATION_REQUEST:
                this.systemManager.registerRoles(command.sourceAddonId, command.data.roles);
                return;
            case SCRIPT_EVENT_COMMAND_IDS.ROLE_RE_REGISTRATION_REQUEST:
                this.systemManager.requestRoleReRegistration();
                return;
            case SCRIPT_EVENT_COMMAND_IDS.OPEN_FORM_ROLE_COMPOSITION:
                this.systemManager.openFormRoleComposition(command.data.playerId);
                return;
            case SCRIPT_EVENT_COMMAND_IDS.GET_PLAYER_WEREWOLF_DATA:
                const playerId = command.data.playerId;
                const playerData = this.systemManager.getInGameManager()?.getPlayerData(playerId);
                if (!playerData)
                    return KairoUtils.buildKairoResponse(
                        {},
                        false,
                        "The game is not currently in progress.",
                    );

                const playerDataDTO: PlayerDataDTO = {
                    playerId,
                    name: playerData.name,
                    isAlive: playerData.isAlive,
                    isVictory: playerData.isVictory,
                    role: playerData.role,
                };
                return KairoUtils.buildKairoResponse({ playerData: playerDataDTO });
            case SCRIPT_EVENT_COMMAND_IDS.GET_PLAYERS_WEREWOLF_DATA:
                const playersData = this.systemManager.getInGameManager()?.getPlayersData();
                if (!playersData)
                    return KairoUtils.buildKairoResponse(
                        {},
                        false,
                        "The game is not currently in progress.",
                    );

                const playersDataDTO: PlayerDataDTO[] = playersData.map((playerData) => ({
                    playerId: playerData.player.id,
                    name: playerData.name,
                    isAlive: playerData.isAlive,
                    isVictory: playerData.isVictory,
                    role: playerData.role,
                }));

                return KairoUtils.buildKairoResponse({
                    playersData: playersDataDTO,
                });
            default:
                return;
        }
    }
}
