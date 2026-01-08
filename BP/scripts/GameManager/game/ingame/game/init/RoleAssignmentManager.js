import { defaultRole } from "../../../../data/roles";
export class RoleAssignmentManager {
    constructor(gameInitializer) {
        this.gameInitializer = gameInitializer;
    }
    static create(gameInitializer) {
        return new RoleAssignmentManager(gameInitializer);
    }
    assign(players) {
        const rolePool = this.buildRolePool(this.gameInitializer.getInGameManager().getRoleComposition(), players.length);
        this.shuffle(rolePool);
        players.forEach((player, index) => {
            const role = rolePool[index];
            if (!role)
                return;
            this.assignRoleToPlayer(player, role);
        });
    }
    assignRoleToPlayer(player, role) {
        const playerData = this.gameInitializer.getInGameManager().getPlayerData(player.id);
        playerData.setRole(role);
    }
    buildRolePool(roleComposition, playerCount) {
        const pool = [];
        for (const role of roleComposition) {
            const amount = role.count?.amount ?? 0;
            for (let i = 0; i < amount; i++) {
                pool.push(role);
            }
        }
        while (pool.length < playerCount) {
            pool.push(defaultRole);
        }
        return pool;
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
