import type { Player } from "@minecraft/server";

export type ParticipationState = "participant" | "spectator";

export class PlayerData {
    public name: string;
    public isAlive: boolean = true;
    public isVictory: boolean = false;

    constructor(
        public readonly player: Player,
        public state: ParticipationState = "participant",
    ) {
        this.name = player.name;
    }

    public get isParticipating(): boolean {
        return this.state === "participant";
    }
}
