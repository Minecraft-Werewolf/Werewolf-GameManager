import { EntityComponentTypes, world } from "@minecraft/server";
import { GAMES, SYSTEMS } from "../../../../constants/systems";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../../constants/translate";
import { TerminationReason } from "../GameTerminationEvaluator";
export class GameResultPresentation {
    constructor(gameTerminator) {
        this.gameTerminator = gameTerminator;
    }
    static create(gameTerminator) {
        return new GameResultPresentation(gameTerminator);
    }
    async runGameResultPresentaionAsync(players) {
        try {
            await this.runStep(async () => this.showGameTerminatedTitle(players));
            await this.runStep(async () => this.showGameResult(players));
        }
        catch (e) {
            console.warn(`[GameTerminator] Termination interrupted: ${String(e)}`);
        }
    }
    async runStep(stepFn) {
        if (this.gameTerminator.isCancelled)
            throw new Error("Initialization cancelled");
        await stepFn();
    }
    async showGameTerminatedTitle(players) {
        world.sendMessage({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_TERMINATION_MESSAGE,
        });
        players.forEach((player) => {
            this.showGameTerminatedTitleForPlayer(player);
            player.getComponent(EntityComponentTypes.Inventory)?.container.clearAll();
            player.playSound(SYSTEMS.GAME_TERMINATION.SOUND_ID, {
                location: player.location,
                pitch: SYSTEMS.GAME_TERMINATION.SOUND_PITCH,
                volume: SYSTEMS.GAME_TERMINATION.SOUND_VOLUME,
            });
        });
        await this.gameTerminator
            .getWaitController()
            .waitTicks(SYSTEMS.GAME_TERMINATION_TITLE.STAY_DURATION);
    }
    async showGameResult(players) {
        const terminator = this.gameTerminator;
        const inGameManager = terminator.getInGameManager();
        const evaluateResult = inGameManager.getGameManager().evaluateResult;
        const winningFactionTitleId = this.getWinningFactionTitleTranslateId(evaluateResult);
        world.sendMessage({ translate: winningFactionTitleId });
        players.forEach((player) => {
            const playerData = inGameManager.getPlayerData(player.id);
            this.playResultSound(player, playerData.isVictory);
            const { subtitleId, messageId } = this.getPlayerResultTextIds(evaluateResult, playerData.isVictory);
            player.onScreenDisplay.setTitle({ translate: winningFactionTitleId }, {
                subtitle: { translate: subtitleId },
                ...GAMES.UI_RESULT_WINNING_FACTION_TITLE_ANIMATION,
            });
            player.sendMessage({ translate: messageId });
        });
        this.broadcastPlayersAliveState(inGameManager.getPlayersData());
        await terminator.getWaitController().waitTicks(SYSTEMS.GAME_SHOW_RESULT.DURATION);
    }
    playResultSound(player, isVictory) {
        const sound = isVictory ? SYSTEMS.GAME_VICTORY.SOUND_ID : SYSTEMS.GAME_DEFEAT.SOUND_ID;
        const pitch = isVictory
            ? SYSTEMS.GAME_VICTORY.SOUND_PITCH
            : SYSTEMS.GAME_DEFEAT.SOUND_PITCH;
        const volume = isVictory
            ? SYSTEMS.GAME_VICTORY.SOUND_VOLUME
            : SYSTEMS.GAME_DEFEAT.SOUND_VOLUME;
        player.playSound(sound, { location: player.location, pitch, volume });
    }
    getPlayerResultTextIds(result, isVictory) {
        const isDraw = result === TerminationReason.Annihilation || result === TerminationReason.Timeup;
        if (isDraw) {
            return {
                subtitleId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_DRAW,
                messageId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_DRAW_MESSAGE,
            };
        }
        if (isVictory) {
            return {
                subtitleId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_VICTORY,
                messageId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_VICTORY_MESSAGE,
            };
        }
        return {
            subtitleId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_DEFEAT,
            messageId: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_DEFEAT_MESSAGE,
        };
    }
    broadcastPlayersAliveState(playersData) {
        const lines = [];
        playersData.forEach((playerData) => {
            const translateId = playerData.isAlive
                ? WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_ALIVE
                : WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_DEAD;
            lines.push({
                rawtext: [
                    { text: playerData.name },
                    { text: SYSTEMS.SEPARATOR.COLON },
                    { text: playerData.role?.color || SYSTEMS.COLOR_CODE.RESET },
                    playerData.role?.name || { text: "Unknown Role" },
                    { text: SYSTEMS.COLOR_CODE.RESET },
                    { text: SYSTEMS.SEPARATOR.SPACE },
                    { translate: translateId },
                ],
            });
        });
        world.sendMessage({
            rawtext: lines.flatMap((line) => [...line.rawtext, { text: "\n" }]),
        });
    }
    getWinningFactionTitleTranslateId(result) {
        switch (result) {
            case TerminationReason.Annihilation:
                return WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_ANNIHILATION;
            case TerminationReason.Timeup:
                return WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_TIMEUP;
            case TerminationReason.VillagerVictory:
                return WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_VILLAGER_FACTION_WIN;
            case TerminationReason.WerewolfVictory:
                return WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_WEREWOLF_FACTION_WIN;
            case TerminationReason.FoxVictory:
                return WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_FOX_FACTION_WIN;
            default:
                return WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_RESULT_ANNIHILATION;
        }
    }
    showGameTerminatedTitleForPlayer(player) {
        player.onScreenDisplay.setTitle({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_TERMINATION_TITLE,
        }, {
            fadeInDuration: SYSTEMS.GAME_TERMINATION_TITLE.FADEIN_DURATION,
            stayDuration: SYSTEMS.GAME_TERMINATION_TITLE.STAY_DURATION,
            fadeOutDuration: SYSTEMS.GAME_TERMINATION_TITLE.FADEOUT_DURATION,
        });
    }
}
