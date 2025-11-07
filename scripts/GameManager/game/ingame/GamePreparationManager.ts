import { InputPermissionCategory, world } from "@minecraft/server";
import type { WerewolfGameManager } from "../WerewolfGameManager";

export class GamePreparationManager {
    private constructor(private readonly werewolfGameManager: WerewolfGameManager) {}
    public static create(werewolfGameManager: WerewolfGameManager): GamePreparationManager {
        return new GamePreparationManager(werewolfGameManager);
    }

    public async runPreparationAsync(): Promise<void> {
        const players = world.getPlayers();

        players.forEach((player) => {
            player.teleport(
                { x: 0.5, y: -58.94, z: 24.5 },
                {
                    checkForBlocks: false,
                    dimension: world.getDimension("overworld"),
                    facingLocation: { x: 0, y: -58, z: 0 },
                    keepVelocity: false,
                    // rotation: { x: 0, y: 0 }, // facingLocationを指定しているため不要
                }
            );
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, true);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
        });
    }
}