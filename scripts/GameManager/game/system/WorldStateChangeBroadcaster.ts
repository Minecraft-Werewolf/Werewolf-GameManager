import { system } from "@minecraft/server";
import { ConsoleManager } from "../../../Kairo/utils/ConsoleManager";
import { GameWorldState, type SystemManager } from "../SystemManager";
import { SCRIPT_EVENT_IDS, SCRIPT_EVENT_MESSAGES } from "../../constants/scriptevent";

export class WorldStateChangeBroadcaster {
    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): WorldStateChangeBroadcaster {
        return new WorldStateChangeBroadcaster(systemManager);
    }

    public broadcast(next: GameWorldState): void {
        ConsoleManager.log(`Broadcasting world state change... New state: ${next}`);
        system.sendScriptEvent(
            SCRIPT_EVENT_IDS.WORLD_STATE_CHANGE,
            next === GameWorldState.InGame
                ? SCRIPT_EVENT_MESSAGES.IN_GAME
                : SCRIPT_EVENT_MESSAGES.OUT_GAME,
        );
    }
}
