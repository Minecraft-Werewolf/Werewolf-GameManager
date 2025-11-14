import { GameMode, InputPermissionCategory, world } from "@minecraft/server";
import { SYSTEMS } from "../../../constants/systems";
export class GameFinalizer {
    constructor(inGameManager) {
        this.inGameManager = inGameManager;
    }
    static create(inGameManager) {
        return new GameFinalizer(inGameManager);
    }
    runFinalization() {
        const players = world.getPlayers();
        this.resetPlayersState(players);
        this.teleportPlayers(players);
        this.inGameManager.gameFinalize();
    }
    resetPlayersState(players) {
        players.forEach((player) => {
            player.setGameMode(GameMode.Adventure);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, true);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
        });
    }
    teleportPlayers(players) {
        players.forEach((player) => {
            player.teleport({
                x: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.X,
                y: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.Y,
                z: SYSTEMS.DEFAULT_STAGE_SPAWNPOINT.Z,
            }, {
                checkForBlocks: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.CHECK_FOR_BLOCKS,
                dimension: world.getDimension(SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.DIMENSION),
                // facingLocation: { x: 0, y: -58, z: 0 }, // rotationを指定しているため不要
                keepVelocity: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.KEEP_VELOCITY,
                rotation: {
                    x: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.ROTATION_X,
                    y: SYSTEMS.DEFAULT_STAGE_TELEPORT_OPTIONS.ROTATION_Y,
                },
            });
        });
    }
}
