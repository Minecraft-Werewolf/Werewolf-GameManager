import { ConsoleManager } from "../../../Kairo/utils/ConsoleManager";
import { GameWorldState } from "../SystemManager";
import { SCRIPT_EVENT_COMMAND_IDS, SCRIPT_EVENT_MESSAGES } from "../../constants/scriptevent";
import { KairoUtils } from "../../../Kairo/utils/KairoUtils";
import { KAIRO_COMMAND_TARGET_ADDON_IDS } from "../../constants/systems";
export class WorldStateChangeBroadcaster {
    constructor(systemManager) {
        this.systemManager = systemManager;
    }
    static create(systemManager) {
        return new WorldStateChangeBroadcaster(systemManager);
    }
    broadcast(next) {
        ConsoleManager.log(`Broadcasting world state change... New state: ${next}`);
        const nextState = next === GameWorldState.InGame
            ? SCRIPT_EVENT_MESSAGES.IN_GAME
            : SCRIPT_EVENT_MESSAGES.OUT_GAME;
        KairoUtils.sendKairoCommand(KAIRO_COMMAND_TARGET_ADDON_IDS.BROADCAST, SCRIPT_EVENT_COMMAND_IDS.WORLD_STATE_CHANGE, {
            newState: nextState,
        });
    }
}
