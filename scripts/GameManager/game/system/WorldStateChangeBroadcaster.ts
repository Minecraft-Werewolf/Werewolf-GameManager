import { system } from "@minecraft/server";
import { ConsoleManager } from "../../../Kairo/utils/ConsoleManager";
import { GameWorldState, type SystemManager } from "../SystemManager";
import {
    SCRIPT_EVENT_COMMAND_IDS,
    SCRIPT_EVENT_ID_SUFFIX,
    SCRIPT_EVENT_MESSAGES,
} from "../../constants/scriptevent";
import { SCRIPT_EVENT_ID_PREFIX } from "../../../Kairo/constants/scriptevent";
import { KairoUtils } from "../../../Kairo/utils/KairoUtils";
import { properties } from "../../../properties";

export class WorldStateChangeBroadcaster {
    private constructor(private readonly systemManager: SystemManager) {}
    public static create(systemManager: SystemManager): WorldStateChangeBroadcaster {
        return new WorldStateChangeBroadcaster(systemManager);
    }

    public broadcast(next: GameWorldState): void {
        ConsoleManager.log(`Broadcasting world state change... New state: ${next}`);

        const nextState =
            next === GameWorldState.InGame
                ? SCRIPT_EVENT_MESSAGES.IN_GAME
                : SCRIPT_EVENT_MESSAGES.OUT_GAME;

        KairoUtils.sendKairoCommand(SCRIPT_EVENT_ID_SUFFIX.BROADCAST, {
            commandId: SCRIPT_EVENT_COMMAND_IDS.WORLD_STATE_CHANGE,
            addonId: properties.id,
            newState: nextState,
        });
    }
}
