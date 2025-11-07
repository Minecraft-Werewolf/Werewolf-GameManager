import { InputPermissionCategory, world } from "@minecraft/server";
export class GamePreparationManager {
    constructor(werewolfGameManager) {
        this.werewolfGameManager = werewolfGameManager;
    }
    static create(werewolfGameManager) {
        return new GamePreparationManager(werewolfGameManager);
    }
    async runPreparationAsync() {
        const players = world.getPlayers();
        players.forEach((player) => {
            player.teleport({ x: 0.5, y: -58.94, z: 24.5 }, {
                checkForBlocks: false,
                dimension: world.getDimension("overworld"),
                facingLocation: { x: 0, y: -58, z: 0 },
                keepVelocity: false,
                // rotation: { x: 0, y: 0 }, // facingLocationを指定しているため不要
            });
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, true);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
        });
    }
}
