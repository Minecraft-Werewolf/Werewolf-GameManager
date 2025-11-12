import { world } from "@minecraft/server";
import { MINECRAFT } from "../../../../constants/minecraft";
import { SYSTEMS } from "../../../../constants/systems";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../../constants/translate";
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
            await this.runStep(async () => this.showGameResult());
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
        world.sendMessage({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_TERMINATION_MESSAGE });
        players.forEach((player) => {
            this.showGameTerminatedTitleForPlayer(player);
            const inventoryComponent = player.getComponent(MINECRAFT.COMPONENT_ID_INVENTORY);
            inventoryComponent.container.clearAll();
            player.playSound(SYSTEMS.GAME_TERMINATION_SOUND, {
                location: player.location,
                pitch: SYSTEMS.GAME_TERMINATION_SOUND_PITCH,
                volume: SYSTEMS.GAME_TERMINATION_SOUND_VOLUME,
            });
        });
        await this.gameTerminator.getWaitController().waitTicks(SYSTEMS.GAME_TERMINATION_TITLE_STAY_DURATION);
    }
    async showGameResult() {
        const playersData = this.gameTerminator.getInGameManager().getPlayersData();
        playersData.forEach((playerData) => {
            world.sendMessage(`§a${playerData.name}§r: ${playerData.isAlive}`);
        });
        await this.gameTerminator.getWaitController().waitTicks(SYSTEMS.GAME_SHOW_RESULT_DURATION);
    }
    showGameTerminatedTitleForPlayer(player) {
        player.onScreenDisplay.setTitle({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_TERMINATION_TITLE
        }, {
            fadeInDuration: SYSTEMS.GAME_TERMINATION_TITLE_FADEIN_DURATION,
            stayDuration: SYSTEMS.GAME_TERMINATION_TITLE_STAY_DURATION,
            fadeOutDuration: SYSTEMS.GAME_TERMINATION_TITLE_FADEOUT_DURATION
        });
    }
}
