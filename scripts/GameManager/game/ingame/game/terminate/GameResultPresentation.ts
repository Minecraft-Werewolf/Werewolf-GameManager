import { world, type EntityInventoryComponent, type Player } from "@minecraft/server";
import type { GameTerminator } from "./GameTerminator";
import { MINECRAFT } from "../../../../constants/minecraft";
import { SYSTEMS } from "../../../../constants/systems";
import { WEREWOLF_GAMEMANAGER_TRANSLATE_IDS } from "../../../../constants/translate";

export class GameResultPresentation {
    private constructor(private readonly gameTerminator: GameTerminator) {}
    public static create(gameTerminator: GameTerminator): GameResultPresentation {
        return new GameResultPresentation(gameTerminator);
    }

    public async runGameResultPresentaionAsync(players: Player[]): Promise<void> {
        try {
            await this.runStep(async () => this.showGameTerminatedTitle(players));
            await this.runStep(async () => this.showGameResult());
        } catch (e) {
            console.warn(`[GameTerminator] Termination interrupted: ${String(e)}`);
        }
    }

    private async runStep(stepFn: () => Promise<void> | void): Promise<void> {
        if (this.gameTerminator.isCancelled) throw new Error("Initialization cancelled");
        await stepFn();
    }

    private async showGameTerminatedTitle(players: Player[]): Promise<void> {
        world.sendMessage({ translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_TERMINATION_MESSAGE });
        players.forEach((player) => {
            this.showGameTerminatedTitleForPlayer(player);
            const inventoryComponent = player.getComponent(MINECRAFT.COMPONENT_ID_INVENTORY) as EntityInventoryComponent;
            inventoryComponent.container.clearAll();
            player.playSound(SYSTEMS.GAME_TERMINATION_SOUND, {
                location: player.location,
                pitch: SYSTEMS.GAME_TERMINATION_SOUND_PITCH,
                volume: SYSTEMS.GAME_TERMINATION_SOUND_VOLUME,
            });
        });

        await this.gameTerminator.getWaitController().waitTicks(SYSTEMS.GAME_TERMINATION_TITLE_STAY_DURATION);
    }

    private async showGameResult(): Promise<void> {
        const playersData = this.gameTerminator.getInGameManager().getPlayersData();

        playersData.forEach((playerData) => {
            world.sendMessage(`§a${playerData.name}§r: ${playerData.isAlive}`);
        });

        await this.gameTerminator.getWaitController().waitTicks(SYSTEMS.GAME_SHOW_RESULT_DURATION);
    }

    private showGameTerminatedTitleForPlayer(player: Player): void {
        player.onScreenDisplay.setTitle({
            translate: WEREWOLF_GAMEMANAGER_TRANSLATE_IDS.WEREWOLF_GAME_TERMINATION_TITLE
        }, {
            fadeInDuration: SYSTEMS.GAME_TERMINATION_TITLE_FADEIN_DURATION,
            stayDuration: SYSTEMS.GAME_TERMINATION_TITLE_STAY_DURATION,
            fadeOutDuration: SYSTEMS.GAME_TERMINATION_TITLE_FADEOUT_DURATION
        });
    }
}