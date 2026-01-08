import type { Player } from "@minecraft/server";
import type { GameInitializer } from "./GameInitializer";

export class RoleAssignmentManager {
    private constructor(private readonly gameInitializer: GameInitializer) {}
    public static create(gameInitializer: GameInitializer): RoleAssignmentManager {
        return new RoleAssignmentManager(gameInitializer);
    }

    public assign(players: Player[]): void {}
}
