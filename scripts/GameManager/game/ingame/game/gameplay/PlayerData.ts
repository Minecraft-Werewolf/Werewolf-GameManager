import type { Player } from "@minecraft/server";
import type { RoleDefinition } from "../../../../data/roles";
import type { PlayersDataManager } from "./PlayersDataManager";

export type ParticipationState = "participant" | "spectator";

export class PlayerData {
    public name: string;
    public isAlive: boolean = true;
    public isVictory: boolean = false;
    public role: RoleDefinition | null = null;

    constructor(
        private readonly playerDataManager: PlayersDataManager,
        public readonly player: Player,
        public state: ParticipationState = "participant",
    ) {
        this.name = player.name;
    }

    public get isParticipating(): boolean {
        return this.state === "participant";
    }

    public setRole(role: RoleDefinition): void {
        this.role = role;

        const faction = this.playerDataManager
            .getInGameManager()
            .getFactionData(this.role.factionId);
        if (!faction) return;

        if (this.role.color === undefined) {
            this.role.color = faction.defaultColor;
        }
    }
}
