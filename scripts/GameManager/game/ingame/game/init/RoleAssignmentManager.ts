import type { Player } from "@minecraft/server";
import type { GameInitializer } from "./GameInitializer";
import type { RoleDefinition } from "../../../../data/roles";

export class RoleAssignmentManager {
    private constructor(private readonly gameInitializer: GameInitializer) {}
    public static create(gameInitializer: GameInitializer): RoleAssignmentManager {
        return new RoleAssignmentManager(gameInitializer);
    }

    public assign(players: Player[]): void {
        const roles: RoleDefinition[] = this.gameInitializer
            .getInGameManager()
            .getRoleComposition();

        players.forEach((player) => {});
    }
}
