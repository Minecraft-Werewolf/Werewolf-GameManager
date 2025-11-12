import type { EntityInventoryComponent, Player } from "@minecraft/server";
import type { GameTerminator } from "./GameTerminator";
import { MINECRAFT } from "../../../../constants/minecraft";

export class GameResultPresentation {
    private constructor(private readonly gameTerminator: GameTerminator) {}
    public static create(gameTerminator: GameTerminator): GameResultPresentation {
        return new GameResultPresentation(gameTerminator);
    }

    public async runGameResultPresentaionAsync(players: Player[]): Promise<void> {
        try {
            await this.runStep(async () => this.showGameTerminatedTitle(players));
        } catch (e) {
            console.warn(`[GameTerminator] Termination interrupted: ${String(e)}`);
        }
    }

    private async runStep(stepFn: () => Promise<void> | void): Promise<void> {
        if (this.gameTerminator.isCancelled) throw new Error("Initialization cancelled");
        await stepFn();
    }

    private showGameTerminatedTitle(players: Player[]): void {
        players.forEach((player) => {
            this.showGameTerminatedTitleForPlayer(player);
            const inventoryComponent = player.getComponent(MINECRAFT.COMPONENT_ID_INVENTORY) as EntityInventoryComponent;
            inventoryComponent.container.clearAll();
        });
    }

    private showGameResult(): void {

    }

    private showGameTerminatedTitleForPlayer(player: Player): void {

    }
}